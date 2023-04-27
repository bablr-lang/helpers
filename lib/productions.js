import { objectEntries } from './object.js';
import { map } from './iterable.js';

export const productionFor = (type, match, annotations = null) => {
  return { type, match, annotations };
};

export const productions = (obj) => {
  return map(({ 0: type, 1: match }) => productionFor(type, match), objectEntries(obj));
};

export const mapProductions = (fn, grammar) => {
  const { productions } = grammar;
  return {
    ...grammar,
    productions: map(fn, productions),
  };
};
