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
    RegExpLiteral(p) {
      p.eat('/');
      const pattern = p.eatProduction('Pattern');
      p.eat('/');
      const flags = p.eatProduction('Flags');
      return { pattern, flags };
    },

    Assertion(p) {
      if (p.eatMatch('^')) {
        return { kind: 'start' };
      } else if (p.eatMatch('$')) {
        return { kind: 'end' };
      } else {
        let m;
        if ((m = p.eatMatch(/\\b/iy))) {
          return { kind: 'word', negate: m[1] === 'B' };
        } else {
          throw new Error('invalid boundary');
        }
      }
    },

    Alternatives(p) {
      p.eatProduction('Element');
      while (p.eatMatch('|')) {
        p.eatProduction('Element');
      }
    },

    Element(p) {
      let el;
      if (p.match('[')) {
        el = p.eatProduction('CharacterClass');
      } else if (p.match('(?:')) {
        el = p.eatProduction('Group');
      } else if (p.match(/\(\?<?[=!]/y)) {
        throw new Error('Lookeahead and lookbehind are not supported');
      } else if (p.match('(')) {
        el = p.eatProduction('CapturingGroup');
      } else if (p.match(/[^$]|\\b|/iy)) {
        el = p.eatProduction('Assertion');
      } else if (p.match(/\.|\\[dswp]/iy)) {
        el = p.eatProduction('CharacterSet');
      } else {
        el = p.eatProduction('Character');
      }

      if (p.match(/[*+]|{\d+,?\d*}/y)) {
        p.element = el; // not my best work
        return p.eatProduction('Quantifier');
      } else {
        return el;
      }
    },

    Group(p) {
      p.eat('(?:');
      const alternatives = p.eatProduction('Alternatives');
      p.eat(')');
      return { alternatives };
    },

    CapturingGroup(p) {
      p.eat('(');
      const alternatives = p.eatProduction('Alternatives');
      p.eat(')');
      return { alternatives };
    },

    Pattern(p) {
      const alternatives = p.eatProduction('Alternatives');
      return { alternatives };
    },

    Character(p) {
      const esc = p.eatMatch('\\');
      if (esc) {
        let code;
        const type = p.eat(/[trnvfxu\\/]/y);
        if (type === 'x') {
          code = p.eatMatch(/[0-9a-f]{2}/iy);
        } else if (type === 'u') {
          if (p.eatMatch('{')) {
            code = p.eat(/\d{1,6}/y);
            p.eat('}');
          } else {
            code = p.eatMatch(/\d{4}/y);
          }
        }
        return String.fromCodePoint(parseInt(code, 10));
      } else {
        return p.eat(/\./y);
      }
    },

    CharacterClass(p) {
      p.eat('[');
      const negate = p.eatMatch('^');
      const elements = [];
      while (!p.match(']')) {
        elements.push(p.eatProduction('CharacterClassElement'));
      }
      p.eat(']');
      return { negate, elements };
    },

    CharacterClassElement(p) {
      if (p.match(/.-[^\]\n]/y)) {
        p.eatProduction('CharacterClassRange');
      } else {
        p.eatProduction('Character');
      }
    },

    CharacterClassRange(p) {
      p.eatProduction('Character');
      p.eat('-');
      p.eatProduction('Character');
    },

    CharacterSet(p) {
      if (p.eatMatch('.')) {
        return { kind: 'any' };
      }

      p.eat('\\');

      if (p.eatMatch(/d/iy)) {
        return { kind: 'digit' };
      } else if (p.eatMatch(/s/iy)) {
        return { kind: 'space' };
      } else if (p.eatMatch(/w/iy)) {
        return { kind: 'word' };
      } else if (p.eatMatch(/p/iy)) {
        throw new Error('unicode property character sets are not supported yet');
      } else {
        throw new Error('unknown character set kind');
      }
    },

    Quantifier(p) {
      let min,
        max = Infinity;

      if (p.eatMatch('*')) {
        min = 0;
      } else if (p.eatMatch('+')) {
        min = 1;
      } else {
        p.eat('{');
        min = max = parseInt(p.eat(/\d+/y), 10);
        if (p.eatMatch(',')) {
          let m;
          if ((m = p.eatMatch(/\d+/y))) {
            max = parseInt(m, 10);
          }
        }
        p.eat('}');
      }

      const greedy = p.eatMatch('?');

      const { element } = p;

      p.element = null;
      return { min, max, greedy, element };
    },

    Flags(p) {
      const flags = p.eatMatch(/[gimsuy]+/y);
      if (!unique(flags)) {
        throw new Error('flags must be unique');
      }
    },
  }),

  aliases: objectEntries({
    Node: [
      'RegExpLiteral',
      'Assertion',
      'Alternative',
      'Group',
      'CapturingGroup',
      'Pattern',
      'Character',
      'CharacterClass',
      'CharacterClassRange',
      'CharacterSet',
      'Quantifier',
      'Flags',
    ],
  }),
});
