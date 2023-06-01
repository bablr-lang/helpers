import { objectEntries } from './object.js';
import { map } from './iterable.js';

export const productionFor = (type, value, annotations = null) => {
  return { type, value, annotations };
};

export const productions = (obj) => {
  return map(({ 0: type, 1: value }) => productionFor(type, value), objectEntries(obj));
};

export const mapProductions = (fn, grammar) => {
  const { productions } = grammar;
  return {
    ...grammar,
    productions: map(fn, productions),
  };
};
