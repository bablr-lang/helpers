const { match } = require('./commands.js');
const { concatTokens } = require('./utils.js');

function* Bag(takeables) {
  const len = takeables.length;
  let tokenss = []; // A double plural, yes

  for (let i = 0, n = 0; n < len; i = (i + 1) % len, n++) {
    const tokens = yield* match(takeables[i]);
    tokenss.push(tokens);
    if (tokens) n = -1;
  }

  return concatTokens(...tokenss);
}

module.exports = { Bag };
