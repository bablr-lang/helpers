import escapeRegex from 'escape-string-regexp';

import { isString, isRegex, isPattern } from './object.js';

export { escapeRegex, isString, isRegex, isPattern };

export const regexFromPattern = (pattern) => {
  if (isString(pattern)) return new RegExp(escapeRegex(pattern), 'y');
  else if (isRegex(pattern)) return pattern;
  else throw new Error('invalid pattern');
};
