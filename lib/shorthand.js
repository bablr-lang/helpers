import { isArray, isString, isRegex } from './object.js';
import { templateParse } from './parser.js';
import { stringPattern, regexPattern } from './ast.js';
import { grammar as matchableGrammar } from './matchable.js';
import * as sym from './symbols.js';

export * from './ast.js';

const buildMatchable = (...args) => {
  if (isArray(args[0])) {
    return m(...args);
  } else {
    const { 0: matchable } = args;
    return isRegex(matchable)
      ? regexPattern(matchable)
      : isString(matchable)
      ? stringPattern(matchable)
      : matchable;
  }
};

export const matchable = (...args) => {
  if (isString(args[0])) {
    return stringPattern(args[0]);
  } else if (isRegex(args[0])) {
    return regexPattern(args[0]);
  } else if (isArray(args[0])) {
    return templateParse(matchableGrammar, 'Matchable', ...args);
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

export const str = (args) => stringPattern(args[0]);
export const re = (args) => regexPattern(args[0]);
