import { objectEntries, isString } from './object.js';
import { map } from './iterable.js';

export const productionFor = (type, match, annotations = null) => {
  return { type, match, annotations };
};

export const productions = (obj) => {
  return map(({ 0: type, 1: match }) => productionFor(type, match), objectEntries(obj));
};

export const annotatedProductions = (obj) => {
  return {
    *[Symbol.iterator]() {
      let annotations = null;
      let annotationsName = null;
      for (const { 0: type, 1: value } of objectEntries(obj)) {
        const parts = isString(type) ? type.split('$') : null;

        if (annotationsName !== null && (!parts || annotationsName !== parts[0])) throw new Error();

        if (parts && parts.length > 1) {
          if (parts.length > 2) throw new Error('unexpected $ in annotation');
          if (!annotations) {
            annotations = new Map();
            annotationsName = parts[0];
          }

          annotations.set(parts[1], value);
        } else {
          yield productionFor(type, value, annotations);
          annotations = null;
          annotationsName = null;
        }
      }

      if (annotations) throw new Error();
    },
  };
};

export const mapProductions = (fn, grammar) => {
  const { productions } = grammar;
  return {
    ...grammar,
    productions: map(fn, productions),
  };
};
