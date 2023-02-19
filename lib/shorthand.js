import * as sym from './symbols.js';

const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';
const { isArray } = Array;
const stripArray = (value) => (isArray(value) ? value[0] : value);

export const prod = (str) => {
  const stripped = stripArray(str);
  let property = null;
  let type;
  if (isString(stripped)) {
    [property, type] = stripped.split(/:/); // not /g, so this only splits once!
  } else if (isSymbol(stripped)) {
    type = stripped;
  } else {
    throw new Error();
  }

  return {
    type: sym.production,
    value: { type, property, props: undefined },
  };
};

export const tok = (str) => {
  const stripped = stripArray(str);
  let value = null;
  let type;
  if (isString(stripped)) {
    [value, type] = stripped.split(/:/);
  } else if (isSymbol(stripped)) {
    type = stripped;
  } else {
    throw new Error();
  }

  return {
    type: sym.terminal,
    value: { type, value },
  };
};

export const chrs = (value) => {
  return {
    type: sym.terminal,
    value: stripArray(value),
  };
};
