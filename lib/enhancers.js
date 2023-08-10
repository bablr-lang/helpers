import { mapObject } from './object.js';
import { map, objectEntries } from './iterable.js';

export const memoize = (original) => {
  const cache = new WeakMap();
  const memoized = (...args) => {
    if (args.length > 1) throw new Error('A memoized function accepts only one argument');
    const arg = args[0];

    if (cache.has(arg)) {
      return cache.get(arg);
    } else {
      return original(arg);
    }
  };
  return memoized;
};

const identity = (x) => x;

export const compose = (functions) => {
  let first = true;
  let f = identity;
  for (const g of functions) {
    if (first) {
      f = g;
    } else {
      const f_ = f;
      f = (x) => f_(g(x));
    }
    first = false;
  }

  return f;
};

export const mapProductions = (fn, grammar) => {
  const { productions } = grammar;
  return {
    ...grammar,
    productions: map(fn, productions),
  };
};

export const mapGrammars = (fn, language) => {
  return {
    ...language,
    grammars: mapObject(fn, language.grammars),
  };
};
