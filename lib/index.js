const { isArray, arrayFirst, arrayLast, concatTokens } = require('./utils.js');
const { ref, Reference, LineBreak } = require('./descriptors.js');
const { Bag } = require('./generators.js');
const {
  branch,
  accept,
  reject,
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  delegate,
  test,
  match,
  take,
  eat,
  eatMatch,
} = require('./commands.js');

module.exports = {
  isArray,
  arrayFirst,
  arrayLast,
  concatTokens,
  ref,
  Reference,
  LineBreak,
  Bag,
  branch,
  accept,
  reject,
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  delegate,
  test,
  match,
  take,
  eat,
  eatMatch,
};
