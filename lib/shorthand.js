import { isType, isObject, isArray } from './object.js';
import * as sym from './symbols.js';

export const node = (...args) => {
  let value;
  if (isType(args[0])) {
    value = { type: args[0], property: args[1], value: args[2] };
  } else if (isObject(args[0]) && !isArray(args[0])) {
    throw new Error();
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    const [_type, property] = interpolated.split(/:/); // not global: only split once!
    value = { type: _type, property };
  } else {
    throw new Error();
  }

  return { type: sym.node, value };
};

export const tok = (...args) => {
  let value;
  if (isType(args[0])) {
    value = { type: args[0], value: args[1], alterLexicalContext: args[2] };
  } else if (isObject(args[0]) && !isArray(args[0])) {
    throw new Error();
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    const [type, value_] = interpolated.split(/:/); // not global: only split once!
    value = { type, value: value_, alterLexicalContext: undefined };
  } else {
    throw new Error();
  }

  return { type: sym.token, value };
};

export const bnd = (type, value) => {
  return { type: sym.boundary, value: { type, value } };
};

export const chrs = (pattern) => {
  if (!pattern) throw new Error('chrs requires a pattern');

  const value = isArray(pattern) ? pattern[0] : pattern;

  return { type: sym.character, value };
};
