'use strict';

exports.input = [
  { keywords: ['a', 'b', 'c'] },
  { keywords: ['a', 'a', 'c', 'd'] },
  { keywords: ['d', 'f', 'd', 'i'] },
  { keywords: ['i', 'a', 'b'] },
  { keywords: [] }
];

exports.output = {
  2: ['a', 'b', 'c', 'd', 'i'],
  3: ['a']
};
