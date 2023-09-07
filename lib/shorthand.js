import { buildTag } from '@bablr/miniparser';
import { isArray } from './object.js';
import { spamexLanguage, regexLanguage } from './languages.js';
import * as sym from './symbols.js';

const buildMatchable = (...args) => {
  if (isArray(args[0])) {
    return spam(...args);
  } else {
    const { 0: matchable } = args;
    return matchable;
  }
};

export const spam = buildTag(spamexLanguage, 'Expression');
export const re = buildTag(regexLanguage, 'RegExpLiteral');
export const str = spam.StringMatcher;

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
