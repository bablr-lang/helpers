const { eatMatch, All } = require('./commands.js');

function* Bag(takeables, getState) {
  const { length } = takeables;
  const s = getState();

  for (let i = 0, n = 0; n < length && !s.source.done; i = (i + 1) % length, n++) {
    const tokens = yield* eatMatch(takeables[i]);
    if (tokens) n = -1;
  }
}

module.exports = { All, Bag };
