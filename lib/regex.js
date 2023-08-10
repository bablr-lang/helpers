import escapeRegex from 'escape-string-regexp';
import { Grammar } from '@bablr/grammar';

import { productions } from './iterable.js';
import { isString, isRegex, isPattern, objectEntries } from './object.js';

export { escapeRegex, isString, isRegex, isPattern };

export const regexFromPattern = (pattern) => {
  if (isString(pattern)) return new RegExp(escapeRegex(pattern), 'y');
  else if (isRegex(pattern)) return pattern;
  else throw new Error('invalid pattern');
};

export const escapeCharacterClass = (str) => str.replace(/]\\-/g, (r) => `\\${r}`);

const unique = (arr) => arr.length !== new Set(arr).size;

export const grammar = new Grammar({
  productions: productions({
    Pattern(p) {
      p.eat('/');
      const source = p.eatProduction('Source');
      p.eat('/');
      const flags = p.eatProduction('Flags');
      return { source, flags };
    },

    Source(p) {
      if (p.match('[')) {
      } else if (p.match('(')) {
      } else if (p.match('\\')) {
      }
    },

    Flags(p) {
      const flags = p.eatMatch(/[gimsuy]+/y);
      if (!unique(flags)) {
        throw new Error('flags must be unique');
      }
    },
  }),

  aliases: objectEntries({
    Node: ['Pattern'],
  }),
});
