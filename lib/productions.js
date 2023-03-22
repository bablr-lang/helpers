import { objectEntries } from './object.js';

export const productionFor = (type, match, annotations = null) => {
  return { type, match, annotations };
};

export function* annotatedProductions(obj) {
  let annotations = null;
  let annotationsName = null;
  for (const { 0: type, 1: value } of objectEntries(obj)) {
    const parts = type.split('$');

    if (annotationsName !== null && annotationsName !== parts[0]) throw new Error();

    if (parts.length > 1) {
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
}
