const { match } = require('./commands.js');
const { arrayLast, concatTokens } = require('./utils.js');

function* Bag(takeables) {
  let tokenss = []; // A double plural, yes
  let i = 0;
  do {
    tokenss.push(yield* match(takeables[i]));
    i = arrayLast(tokenss) === null ? i + 1 : 0;
  } while (i < takeables.length);

  return concatTokens(...tokenss);
}

module.exports = { Bag };
