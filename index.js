/*
 * Breach: [breach-manager] A module manager for Breach
 *
 * Copyright (c) 2014, Michael Bøcker-Larsen. All rights reserved.
 *
 * @author: mblarsen
 */
"use strict"

var express = require('express');
var http = require('http');
var breach = require('breach_module');
var async = require('async');
var request = require('request');
var jade = require('jade');
var common = require('breach_module/lib/common');
var cache = require('./lib/cache.js')
var _ = require('lodash');

var bootstrap = function (server) {
  breach.init(function () {
    breach.expose('init', function (src, args, cb) {
      var result = cache.search('firebase');
      var moduleNames = _.map(result, function (pkg) { return pkg.name + '@' + pkg.version; });
      console.log(moduleNames);
      
      cb();
    });
    breach.expose('kill', function (args, cb) {
      common.exit(0);
    });
  });
};

(function setup() {
  var app = express();

  // TODO consider adding debug option 
  
  app.use('/', express.static(__dirname + '/controls'));
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('body-parser').json());
  app.use(require('method-override')());
  
  var server = http.createServer(app).listen(0, '127.0.0.1');

  server.on('listening', function() {
    var port = server.address().port;
    common.log.out('HTTP Server started on `http://127.0.0.1:' + port + '`');
    return bootstrap(server);
  });
})();

