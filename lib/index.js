const { isArray, arrayFirst, arrayLast, concatTokens } = require('./utils.js');
const { ref, Reference, LineBreak } = require('./descriptors.js');
const { All, Bag } = require('./generators.js');
const {
  reject,
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  testGrammar,
  matchGrammar,
  takeGrammar,
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
  All,
  Bag,
  reject,
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  testGrammar,
  matchGrammar,
  takeGrammar,
  test,
  match,
  take,
  eat,
  eatMatch,
};
