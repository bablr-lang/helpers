import {
  enhanceStrategyBuilderWithDebugLogging as logStrategy,
  enhanceStrategyBuilderWithEmittedLogging as logEmitted,
} from '@bablr/strategy_enhancer-debug-log';
import { enhanceProductionWithDebugLogging as createProductionLogger } from '@bablr/language_enhancer-debug-log';

const { getOwnPropertyNames, hasOwn } = Object;

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

export const mapProductions = (fn, Grammar) => {
  let { prototype } = Grammar;

  class MappedGrammar extends Grammar {}

  const mapped = MappedGrammar.prototype;

  while (prototype) {
    for (const key of getOwnPropertyNames(prototype)) {
      if (!hasOwn(mapped, key)) {
        mapped[key] = fn(prototype[key], key);
      }
    }
    ({ prototype } = prototype);
  }

  return MappedGrammar;
};

export const buildDebugEnhancers = (log) => {
  return {
    emitStrategy: (strategy) => logEmitted(strategy, '>>> ', log),
    agastStrategy: (strategy) => logStrategy(strategy, '      ', log),
    bablrProduction: createProductionLogger('    ', log),
  };
};

export const debugEnhancers = buildDebugEnhancers();
