/*
 * Breach: [breach-manager] A module manager for Breach
 *
 * Copyright (c) 2014, Michael Bøcker-Larsen. All rights reserved.
 *
 * @author: mblarsen
 */
'use strict';

var breach = require('breach_module');
var socket = require('socket.io');
var async = require('async');
var request = require('request');
var common = require('breach_module/lib/common');
var _ = require('lodash');
var cache = require('./lib/cache');
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
        socket.on('handshake', function () {
          console.log(socket);
          cache.all().then(function (result) {
            var modules = _.map(result, function (pkg) {
              return {
                name: pkg.name,
                version: pkg['dist-tags'].latest,
                selected: false
              };
            });

            socket.emit('modules-all', modules);
          });
        });
      }); 

      cache.all().then(function (result) {
        var moduleNames = _.map(result, function (pkg) { return pkg.name + '@' + pkg['dist-tags'].latest; });

        out('Found: (' + moduleNames.length + ') ' + moduleNames.join(', '));
        out('Categories: ' + categories(result, 10, [cache.moduleKeyword]));
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

// Run web-server for module webapp
(function setup() {
  initApp(bootstrap);
}());
