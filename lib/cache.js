'use strict';

var npm = require('npm'),
  textSearch = require('fuzzy-filter'),
  path = require('path'),
  fs = require('fs'),
  common = require('breach_module/lib/common'),
  _ = require('lodash');

var moduleKeyword = 'queue';//'breach-module';

var _cache = {
  endKey: 0,
  loaded: false,
  file: path.join(process.env.HOME, '.npm', '-/all/.cache.json')
};

var _loadCache = function (done) {
  _cache.loaded = true;
  common.log.out('Loading cache from: ' + _cache.file);
  var data = fs.readFileSync(_cache.file, { encoding: 'UTF-8' });
  _cache.packages = _.filter(JSON.parse(data), _filterByKeyword);
  _cache.loaded = true;
  common.log.out('Packages in cache: ' + _cache.packages.length);
};

var _filterByKeyword = function (pkg) {
  return (pkg.keywords instanceof Array) && pkg.keywords.indexOf(moduleKeyword) !== -1;
};

var _filterByQuery = function (pkg) {
  var input = [pkg.name, pkg.description].concat(pkg.keywords);
  return textSearch(this.q, input).length !== 0;
};

var search = function (q) {
  // Lazy load cache
  if (!_cache.loaded) {
    _loadCache();
  }
  common.log.out('Searching in ' + _cache.packages.length + ' packages');
  _cache.lastResult = _.filter(_cache.packages, _filterByQuery, { q: q });
  return _cache.lastResult;
};

// Refreshes the cache from NPM
var refresh = function () {
  // TODO update endKey and save cache
};

var install = function (module) {
  //
};

module.exports = {
  search: search,
  refresh: refresh,
  install: install
};