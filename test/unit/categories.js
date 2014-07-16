'use strict';

var categories = require('../../lib/categories');
var fixtures = require('../fixtures/categories');

module.exports = function (t) {
  t.test('Returns keywords that are repeated n times', function (n) {
    var result2 = categories(fixtures.input, 2);
    var result3 = categories(fixtures.input, 3);

    n.same(result2, fixtures.output[2]);
    n.same(result3, fixtures.output[3]);
    n.end();
  });

  t.test('Ignores keywords set to be ignored', function (n) {
    var result2 = categories(fixtures.input, 2, ['i']);
    
    n.same(result2, fixtures.output[2].slice(0, -1));   
    n.end();
  });
};
