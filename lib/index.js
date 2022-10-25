const { isArray, arrayFirst, arrayLast, concatTokens } = require('./utils.js');
const { ref, Reference, LineBreak } = require('./descriptors.js');
const { All, Bag } = require('./generators.js');
const { Fragment } = require('./symbols.js');
const {
  eatChrs,
  matchChrs,
  eatMatchChrs,
  eatGrammar,
  matchGrammar,
  eatMatchGrammar,
  eat,
  match,
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
  Fragment,
  eatChrs,
  matchChrs,
  eatMatchChrs,
  eatGrammar,
  matchGrammar,
  eatMatchGrammar,
  eat,
  match,
  eatMatch,
};
