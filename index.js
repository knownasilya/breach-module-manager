/*
 * Breach: [breach-manager] A module manager for Breach
 *
 * Copyright (c) 2014, Michael Bøcker-Larsen. All rights reserved.
 *
 * @author: mblarsen
 */
'use strict';

var breach = require('breach_module');
var async = require('async');
var request = require('request');
var common = require('breach_module/lib/common');
var _ = require('lodash');
var cache = require('./lib/cache');
var initApp = require('./lib/app');

function bootstrap(server) {
  breach.init(function () {
    breach.expose('init', function (src, args, cb) {
      cache.search('manager').then(function (result) {
        var moduleNames = _.map(result, function (pkg) { return pkg.name + '@' + pkg['dist-tags'].latest; });
        common.log.out('Found: ' + moduleNames.join(', '));
        cb();
      });

      common.log.out('Wait for result');
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
