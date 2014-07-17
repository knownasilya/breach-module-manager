'use strict';

var express = require('express');
var http = require('http');
var common = require('breach_module/lib/common');
var path = require('path');
var hbs = require('hbs');
var host = '127.0.0.1';

module.exports = function (bootstrap) {
  var app = express();
  var server = http.createServer(app);
  
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'hbs');

  // TODO consider adding debug option
  app.use('/', express.static(path.join(__dirname, '..', 'controls')));
  app.use('/elements', express.static(path.join(__dirname, '..', 'bower_components')));
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('body-parser').json());
  app.use(require('method-override')());

  app.get('/manager', function (req, res) {
    res.render('manager', {
      url: 'http://' + host + ':' + server.address().port + '/'
    });
  });

  app.get('/modules', function (req, res) {
    res.json([
      { name: 'mod_strip', selected: false },
      { name: 'mod_newtab', selected: false },
      { name: 'mod_testme', selected: false },
      { name: 'mod_devtools', selected: false }
    ]);
  });

  server.listen(0, host);
  server.on('listening', function () {
    var port = server.address().port;
    common.log.out('HTTP Server started on `http://127.0.0.1:' + port + '`');

    return bootstrap(server);
  });
};
