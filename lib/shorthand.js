import * as sym from './symbols.js';

const isObject = (val) => val !== null && typeof val === 'object';
const { isArray } = Array;
const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';

export const node = (...args) => {
  let property = null;
  let type;
  if (isSymbol(args[0]) || isString(args[0])) {
    type = args[0];
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    [type, property] = interpolated.split(/:/); // not /g, so this only splits once!
  } else {
    throw new Error();
  }

  return {
    type: sym.node,
    value: { type, property, props: undefined },
  };
};

export const tok = (...args) => {
  let value = null;
  let type;
  if (isSymbol(args[0] || isString(args[0]))) {
    type = args[0];
  } else if (isObject(args[0]) && !isArray(args[0])) {
    ({ type, value } = args[0]);
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    [type, value] = interpolated.split(/:/);
  } else {
    throw new Error();
  }

  return {
    type: sym.token,
    value: { type, value },
  };
};

export const chrs = (pattern) => {
  if (!pattern) throw new Error('chrs requires a pattern');

  return {
    type: sym.character,
    value: pattern,
  };
};
