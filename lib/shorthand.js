import { Punctuator, LeftPunctuator, RightPunctuator, Keyword } from './descriptors.js';

const { isArray } = Array;

const stripArray = (v) => (isArray(v) ? v[0] : v);
// Allow a function to be called as either fn(val) or fn`val`
export const withValueArg = (fn) => {
  return { [fn.name]: (v) => fn(stripArray(v)) }[fn.name];
};

export const ref = (name) => stripArray(name);
export const PN = withValueArg(Punctuator);
export const LPN = withValueArg(LeftPunctuator);
export const RPN = withValueArg(RightPunctuator);
export const KW = withValueArg(Keyword);
