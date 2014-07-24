/*
 * Breach: [breach-manager] A module manager for Breach
 *
 * Copyright (c) 2014, Michael Bøcker-Larsen. All rights reserved.
 *
 * @author: mblarsen
 */
'use strict';

var moduleKeyword = 'breach-module';

var breach = require('breach_module');
var socket = require('socket.io');
var async = require('async');
var request = require('request');
var normalize = require('npm-normalize');
var common = require('breach_module/lib/common');
var _ = require('lodash');
var es = require('event-stream');
var cache = require('npm-local-cache')({ keywords: [moduleKeyword] });
var initApp = require('./lib/app');
var categories = require('./lib/categories');
var out = common.log.out;
var error = common.log.error;

function bootstrap(server) {
  var port = server.address().port;
  var io = socket.listen(server);

  breach.init(function () {
    breach.expose('init', function (src, args, cb) {
      io.sockets.on('connection', function (socket) {
        socket.on('handshake', function (handshakeId) {
          out('Connected to `' + handshakeId + '` via websocket.');
          // TODO: stream the modules by page, sending a page (~25 items, maybe configurable later) at a time
          cache.init().then(function (data) {
            var data = cache.getPackages();
            if (typeof data === 'object') {
              var normalized = normalize(data);
              socket.emit('modules-single', { name: normalized.name, version: normalized.version, selected: false });
            }
            return data;                    
          }).then(normalizeResult)
            .then(function (result) {
              if (result && !result.pipe) {
                socket.emit('modules-all', { modules: modules, categories: cats });
              }
            });
        });
      }); 

      cache.init().then(function (result) {
        var result = cache.getPackages();
        var moduleNames = _.map(result, function (pkg) { return pkg.name + '@' + pkg['dist-tags'].latest; });

        out('Found: (' + moduleNames.length + ') ' + moduleNames.join(', '));
        out('Categories: ' + categories(result, 10, [moduleKeyword]));
        cb();
      });

      breach.module('core').call('tabs_new_tab_url', { 
        url: 'http://127.0.0.1:' + port + '/newtab'
      }, function(err) {
        if (err) {
          cb(err, null);
        }

        out('New tab page initialized: http://127.0.0.1:' + port + '/newtab');
      });

      out('Waiting for result..');
    });
    breach.expose('kill', function (args, cb) {
      common.exit(0);
    });
  });
}

function normalizeResult(result) {
  if (!result) {
    return;
  }

  if (result.pipe) {
    return result;
  } else {
    var modules = _.map(result, function (pkg) {
      var meta = normalize(pkg);

      return {
        name: meta.name,
        version: meta.version,
        selected: false
      };
    });

    var cats = categories(result, 5, [moduleKeyword]).map(function (catName) {
      return { name: catName };
    });

    return { modules: modules, categories: cat };
  }
}

// Run web-server for module webapp
(function setup() {
  initApp(bootstrap);
}());
