import { buildTag } from '@bablr/miniparser';
import { isArray, isString, isRegex } from './object.js';
import { string, regex } from './ast.js';
import * as matchableLang from './matchable.js';
import * as sym from './symbols.js';

export * from './ast.js';

const buildMatchable = (...args) => {
  if (isArray(args[0])) {
    return m(...args);
  } else {
    const { 0: matchable } = args;
    return matchable;
  }
};

const matchableTag = buildTag(matchableLang, 'Matchable');

export const matchable = (...args) => {
  if (isString(args[0])) {
    return string(args[0]);
  } else if (isRegex(args[0])) {
    return regex(args[0]);
  } else if (isArray(args[0])) {
    return matchableTag(...args);
  } else {
    throw new Error();
  }
};

export const m = matchable;

export const fail = () => {
  return {
    type: sym.fail,
    value: undefined,
  };
};

export const disambiguate = (choices) => {
  return {
    type: sym.disambiguate,
    value: choices,
  };
};

export const guard = (...args) => {
  return {
    type: sym.match,
    value: {
      effects: { success: sym.none, failure: sym.fail },
      matchable: buildMatchable(...args),
    },
  };
};

export const match = (...args) => {
  return {
    type: sym.match,
    value: {
      effects: { success: sym.none, failure: sym.none },
      matchable: buildMatchable(...args),
    },
  };
};

export const eat = (...args) => {
  return {
    type: sym.match,
    value: {
      effects: { success: sym.eat, failure: sym.fail },
      matchable: buildMatchable(...args),
    },
  };
};

export const eatMatch = (...args) => {
  return {
    type: sym.match,
    value: {
      effects: { success: sym.eat, failure: sym.none },
      matchable: buildMatchable(...args),
    },
  };
};

export const str = (args) => string(args[0]);
export const re = (args) => regex(args[0]);
