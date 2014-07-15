'use strict';

var express = require('express');
var http = require('http');
var jade = require('jade');
var common = require('breach_module/lib/common');
var path = require('path');

module.exports = function (bootstrap) {
  var app = express();

  // TODO consider adding debug option
  app.use('/', express.static(path.join(__dirname, '..', 'controls')));
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('body-parser').json());
  app.use(require('method-override')());

  var server = http.createServer(app).listen(0, '127.0.0.1');

  server.on('listening', function () {
    var port = server.address().port;
    common.log.out('HTTP Server started on `http://127.0.0.1:' + port + '`');

    return bootstrap(server);
  });
};
