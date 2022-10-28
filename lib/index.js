const { isArray, arrayFirst, arrayLast, stripArray } = require('./utils.js');
const { LineBreak } = require('./descriptors.js');
const { All, Bag } = require('./generators.js');
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
  reference,
  startNode,
  endNode,
  ref,
} = require('./commands.js');

module.exports = {
  isArray,
  arrayFirst,
  arrayLast,
  stripArray,
  LineBreak,
  All,
  Bag,
  eatChrs,
  matchChrs,
  eatMatchChrs,
  eatGrammar,
  matchGrammar,
  eatMatchGrammar,
  eat,
  match,
  eatMatch,
  reference,
  startNode,
  endNode,
  ref,
};
