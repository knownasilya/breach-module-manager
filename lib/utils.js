'use strict';

var fs = require('fs');
var Promise = require('promise');

exports.read = Promise.denodeify(fs.readFile);
exports.write = Promise.denodeify(fs.writeFile);

exports.readUTF8 = function (path) {
  return exports.read(path, { encoding: 'utf8' });
};
