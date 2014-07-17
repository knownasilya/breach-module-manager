'use strict';

var _ = require('lodash');

/**
 * Takes keywords from module meta-data and converts them to categories,
 * based on a minimul number of occurrences.
 *
 * @param {Object} pkgData - Package data coming from npm, i.e. package.json + some.
 * @param {Number} min - Minimum number of occurrances for a keyword to become a category.
 * @param {Array(String)} ignoredKeywords - Keywords to ignore, e.g. `breach_module`.. 
 * @return {Array} - Unique list of categories
 */
module.exports = function (pkgData, min, ignoredKeywords) {
  if (!pkgData) {
    return [];
  }

  ignoredKeywords = ignoredKeywords || [];

  var categoryMap = {};
  var keywords = pkgData.filter(function (data) {
    data.keywords = _.unique(data.keywords);
    data.keywords = _.without.apply(_, [data.keywords].concat(ignoredKeywords));
    return data.keywords;
  }).reduce(function (all, data) {
    return all.concat(data.keywords);
  }, []);

  keywords.forEach(function (keyword) {
    var mapped = categoryMap[keyword];

    if (mapped) {
      categoryMap[keyword] += 1;
    }
    else {
      categoryMap[keyword] = 1;
    }
  });

  var categories = Object.keys(categoryMap).filter(function (keyword) {
    return categoryMap[keyword] >= min;
  });
  
  return categories;
};
