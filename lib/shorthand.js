import * as sym from './symbols.js';

const isObject = (val) => val !== null && typeof val === 'object';
const { isArray } = Array;
const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';

export const node = (...args) => {
  let value;
  if (isSymbol(args[0]) || isString(args[0])) {
    value = { type: args[0], props: args[1] };
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    const [_type, property] = interpolated.split(/:/); // not /g, so this only splits once!
    value = { type: _type, props: { property } };
  } else {
    throw new Error();
  }

  return { type: sym.node, value };
};

export const tok = (...args) => {
  let value;
  if (isSymbol(args[0]) || isString(args[0])) {
    value = { type: args[0], props: args[1] };
  } else if (isObject(args[0]) && !isArray(args[0])) {
    value = args[0];
  } else if (isArray(args[0])) {
    const interpolated = String.raw(...args);
    const [type_, value_] = interpolated.split(/:/);
    value = { type: type_, value: value_ };
  } else {
    throw new Error();
  }

  return { type: sym.token, value };
};

export const chrs = (pattern) => {
  if (!pattern) throw new Error('chrs requires a pattern');

  return { type: sym.character, value: pattern };
};
