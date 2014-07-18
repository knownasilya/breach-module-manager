'use strict';

var textSearch = require('fuzzy-filter'),
  npm = require('npm'),
  path = require('path'),
  fs = require('fs'),
  Promise = require('promise'),
  request = require('request'),
  JSONStream = require('JSONStream'),
  es = require('event-stream'),
  common = require('breach_module/lib/common'),
  _ = require('lodash'),
  utils = require('./utils');

common.DEBUG = true;

var moduleKeyword = 'breach-module';
var keywordUrl = 'http://registry.npmjs.org/-/_view/byKeyword?group_level=2&startkey=["' + moduleKeyword +'"]&endkey=["' + moduleKeyword + '",{}]&skip=0&limit=25&stale=update_after';
var byNameUrl = function (names) {
  if (!names) {
    return;
  }

  return 'http://registry.npmjs.org/-/all?keys=["' + names.join('","') + '"]';
};
var localNpmCache = path.join(process.env.HOME, '.npm', '-/all/.cache.json');
var localCache = path.join(__dirname, '..', 'cache.json');

var cache = {
  loaded: false,
  stale: false,
  updatedAt: null,
  packages: {},
  dirty: false,
  lastResult: null
};

/**
 * Will update package data from NPM, returns a promise that when resolves provides an object of packages.
 */
function refreshFromNPM(since) {
  since = since || new Date('2014-02-14').getTime();

  return new Promise(function (resolve, reject) {
    request.get({
      json: true,
      url: 'https://registry.npmjs.org/-/all/since?stale=update_after&startkey=' + since
    }, function (err, httpMessage, body) {
      if (err === undefined && body.error === undefined) {
        resolve(body);
      } else {
        reject({ error: 'Error retrieving from NPM', errorObj: err || body });
      }
    });
  });
}

function searchNPM(cb) {
  return new Promise(function (resolve, reject) {
    request.get({
      json: true,
      url: keywordUrl
    }, function (err, httpMessage, body) {
      if (!err || (body && !body.error)) {
        var moduleNames = body.rows.map(function (row) {
          return row.key[1];
        });
        var url = byNameUrl(moduleNames);
        var stream = request({ url: url })
          .pipe(JSONStream.parse('*'))
          .pipe(es.mapSync(cb || function (d) { return d; }))
          .on('error', function (err) {
            reject(err);
          });

        resolve(stream);
      } else {
        reject({ error: 'Error retrieving from NPM', errorObj: err || body });
      }
    });
  }); 
}

function filterNpmCache(obj) {
  var filteredPackages = _.filter(obj, function (pkg) {
    return (pkg.keywords instanceof Array) && pkg.keywords.indexOf(moduleKeyword) !== -1;
  });

  return filteredPackages;
}

/**
 * Updated metadata.
 * 1. If passed a file path it will read mtime and set updatedAt.
 * 2. If passed an object it will packages, and update updatedAt based on a possible _updated key from NPM.
 */
function updateMetadata(mixed) {
  if (typeof mixed === 'string') {
    cache.updatedAt = fs.statSync(mixed).mtime.getTime();
  } else if (mixed instanceof Object) {
    if (mixed._updated !== undefined) {
      cache.updatedAt = new Date(mixed._updated).getTime();
      delete mixed._updated;
    } else {
      cache.updatedAt = new Date().getTime();
    }
    cache.packages = mixed;
    cache.loaded = true;
  }

  // Check if update from NPM is needed
  if (cache.updatedAt < (new Date().getTime() - 1000 * 60 * 60 * 24)) {
    cache.stale = true;
    cache.dirty = true;
  }

  return Promise.resolve(mixed);
}

function writeCache() {
  if (cache.dirty) {
    common.log.out('Writing local cache');
    cache.dirty = false;
    return utils.write(localCache, JSON.stringify(cache.packages));
  }

  return Promise.resolve(cache.packages);
}

/**
 * TODO: Make this a streaming api, atleast for the full fetch from npm.
 * Loads cache and/or creates cache if it doesn't exist or is out of date.
 */
function loadCache() {
  if (cache.loaded) {
    common.log.out('Cache already loaded, skipping');
    return Promise.resolve(cache.packages);
  }

  common.log.out('Checking for logs in following places:');
  common.log.out('  Local cache      : ' + localCache);
  common.log.out('  Local user cache : ' + localNpmCache);

  var p = null;
  if (fs.existsSync(localCache)) {
    common.log.out('Local cache exists: ' + localCache);
    p = updateMetadata(localCache) // returns file path
      .then(utils.readUTF8)
      .then(function (data) { return JSON.parse(data); })
      .then(function (docs) { return updateMetadata(docs); }) // returns obj
      .then(updateFromNPM);
  } else if (fs.existsSync(localNpmCache)) {
    common.log.out('Local user cache exists: ' + localNpmCache);
    cache.dirty = true;
    p = updateMetadata(localNpmCache) // returns file path
      .then(utils.readUTF8)
      .then(function (data) { return JSON.parse(data); })
      .then(function (docs) { return filterNpmCache(docs); })
      .then(function (docs) { return updateMetadata(docs); }) // returns obj
      .then(updateFromNPM);
  } else {
    common.log.out('No cache exists, loading from NPM: ' + localCache);
    cache.dirty = true;
    p = refreshFromNPM()
      .then(function (docs) { return filterNpmCache(docs); })
      .then(function (docs) { return updateMetadata(docs); });  // returns obj
  }

  // Writes cache if dirty
  return p.then(
    function (docs) { return writeCache(docs); },
    function (err) { common.fatal(err); }
  );
}

/**
 * Get update from NPM if cache marked as stale.
 */
function updateFromNPM(obj) {
  if (false && cache.stale) {
    common.log.out('Package date expired');
    return refreshFromNPM(cache.updatedAt)
      .then(function (docs) { return filterNpmCache(docs); })
      .then(function (obj) {
        if (_.empty(cache.packages)) {
          cache.packages = obj;
        }
        _.each(obj, function (val, pkg) {
          if (pkg === '_updated') return ;
          cache.packages[pkg] = val;
        });
        return Promise.resolve(cache.packages);
      });
  }

  return Promise.resolve(obj);
}

function filterByQuery(pkg) {
  var input = [pkg.name, pkg.description].concat(pkg.keywords);

  return textSearch(this.q, input).length !== 0;
}

/**
 * Public search method that returns a promise, that when resolves provides an object with matching packages.
 */
function search(q) {
  return new Promise(function (resolve, reject) {
    loadCache().then(function () {
      common.log.out('Searching in ' + _.keys(cache.packages).length + ' packages');
      cache.lastResult = _.filter(cache.packages, filterByQuery, { q: q });

      if (!_.isEmpty(cache.lastResult)) {
        resolve(cache.lastResult);
      } else {
        reject(common.err('No result'));
      }
    });
  });
}

function all(singleCb) {
  var resolved = false;

  return new Promise(function (resolve, reject) {
    loadCache().then(function () {
      if (!resolved) {
        resolve(cache.packages);
        resolved = true;
      }
    });

    // If it takes too long just search npm directly..
    // keep loading cache though..
    setTimeout(function () {
      if (!resolved) {
        common.log.out('Searching npm..');
        searchNPM(singleCb).then(function (data) {
          resolve(data);
        });
      } 
    }, 1500);
  });
}

// Refreshes the cache from NPM
function refresh() {
  cache.stale = true;

  return updateFromNPM().then(writeCache);
}

function install(module) {
  var p = refreshFromNPM()
    .then(filterNpmCache)
    .then(updateMetadata);
}

module.exports = {
  search: search,
  all: all,
  refresh: refresh,
  moduleKeyword: moduleKeyword
};
