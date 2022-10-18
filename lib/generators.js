const { match } = require('./commands.js');
const { arrayLast, concatTokens } = require('./utils.js');

function* Bag(generators) {
  let tokenss = []; // A double plural, yes
  let i = 0;
  do {
    tokenss.push(yield* match(generators[i]));
    i = arrayLast(tokenss) === null ? i + 1 : 0;
  } while (i < generators.length);

  return concatTokens(...tokenss);
}

module.exports = { Bag };
