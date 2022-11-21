import { match, eatMatch, All } from './commands.js';
import { EOF } from './symbols.js';

export { All };

export const Bag = (takeables) => {
  return function* Bag() {
    const { length } = takeables;

    for (let i = 0, n = 0; n < length && !(yield* match(EOF)); i = (i + 1) % length, n++) {
      const tokens = yield* eatMatch(takeables[i]);
      if (tokens) n = -1;
    }
  };
};
