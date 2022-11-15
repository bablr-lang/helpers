const { match, eatMatch, All } = require('./commands.js');
const { EOF } = require('./symbols.js');

const Bag = (takeables) => {
  return function* Bag() {
    const { length } = takeables;

    for (let i = 0, n = 0; n < length && !(yield* match(EOF)); i = (i + 1) % length, n++) {
      const tokens = yield* eatMatch(takeables[i]);
      if (tokens) n = -1;
    }
  };
};

module.exports = { All, Bag };
