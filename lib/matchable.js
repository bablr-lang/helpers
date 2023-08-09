import { Grammar } from '@bablr/grammar';
import { productions } from './productions.js';
import { concat } from './iterable.js';
import { objectEntries } from './object.js';

function parseString(raw) {
  let cooked = '';
  let escaped = false;

  for (const chr of raw) {
    if (chr === '\\') {
      escaped = true;
    } else {
      if (escaped) {
        // TODO: do escape processing things
        escaped = false;
      } else {
        cooked += chr;
      }
    }
  }
  return cooked;
}

function escapeString(string) {
  return string.replace(/[\\']/g, '\\$&');
}

// TODO Grammar is heavier than I really need now
export const grammar = new Grammar({
  productions: productions({
    Matchable(p) {
      if (p.match('<')) {
        return p.eatProduction('Tag');
      } else if (p.match(/['"]/y)) {
        return p.eatProduction('RegexPattern');
      } else if (p.match('/')) {
        return p.eatProduction('RegexPattern');
      } else {
        throw new Error(`Unexpected character ${p.chr}`);
      }
    },

    StringPattern(p) {
      return p.eatProduction('String');
    },

    // RegexPattern(p) {
    //   return p.eatProduction('Regex');
    // },

    Tag(p) {
      if (p.match('<|')) {
        return p.eatProduction('TokenTag');
      } else if (p.match('<!')) {
        throw new Error('doctype tag syntax is not necessary in grammar definitions');
      } else if (p.match('</')) {
        throw new Error('close tag syntax is not necessary in grammar definitions');
      } else if (p.match('<[')) {
        throw new Error('gap tag syntax is not necessary in grammar definitions');
      } else if (p.match(/<(?:\w|$)/y)) {
        return p.eatProduction('GapTag');
      } else {
        throw new Error(`Unexpected character ${p.chr}`);
      }
    },

    TokenTag(p) {
      p.eat('<|');
      p.eatMatch(/[ \t]+/y);

      const type = p.eat(/\w+/y);

      let sp = p.eatMatch(/[ \t]+/y);

      const value = /['"]/y.test(p.chr) ? p.eatProduction('String') : null;

      sp = value ? p.eatMatch(/[ \t]+/y) : sp;

      const attrs = sp ? p.eatProduction('Attributes') : [];

      p.eatMatch(/[ \t]+/y);

      p.eat('|>');

      const attrsMap = new Map(concat(value ? [['value', value]] : [], attrs));

      if (value && attrsMap.get('value') !== value) {
        // this check technically makes it legal to do <| T 'v' value='v' |>
        // but it also ensures that value is the first attribute
        // so I don't care
        throw new Error('value shorthand is used in matchables');
      }

      return { type, value: undefined, attrs: attrsMap };
    },

    GapTag(p) {
      p.eat('<');

      const type = p.eatProduction('Identifier');

      const sp = p.eatMatch(/[ \t]+/y);

      const attrs = sp ? p.eatProduction('Attributes') : [];

      p.eatMatch(/[ \t]+/y);

      p.eat('>');

      return { type, attrs: new Map(attrs) };
    },

    Attributes(p) {
      const attrs = [];
      let sp = true;
      while (sp && !p.done && (p.literalDone || p.match(/\w/y))) {
        if (p.literalDone) {
          for (const { 0: key, 1: value } of p.eatProduction('Attributes')) attrs.set(key, value);
        } else {
          attrs.push(p.eatProduction('Attribute'));
        }
        sp = p.eatMatch(/[ \t]+/y);
      }
      return attrs;
    },

    Identifier(p) {
      return p.eat(/\w+/y);
    },

    String(p) {
      const q = p.eat(/['"]/y);

      const raw = p.eat(q === '"' ? /[^\n"]*/y : /[^\n']*/y);

      p.eat(q);

      return parseString(raw);
    },

    Attribute(p) {
      const key = p.eat(/\w+/y);
      p.eatMatch(/[ \t]+/y);
      p.eat('=');
      p.eatMatch(/[ \t]+/y);
      const value = p.eatProduction('String');

      return [key, value];
    },
  }),

  aliases: objectEntries({
    Node: ['GapTag', 'TokenTag', 'RegexPattern', 'StringPattern'],
  }),
});

export const printAttrs = (attrs) => {
  let result = [];
  for (const attr of objectEntries(attrs)) {
    result.push(`${attr[0]}='${escapeString(attrs[1])}'`);
  }
  return result.length ? ' ' + result.join(' ') : '';
};

export const printValue = (value) => {
  return value != null ? ` '${escapeString(value)}'` : '';
};

export const print = (matchable) => {
  switch (matchable.type) {
    case 'TokenTag': {
      const { type, value, attrs } = matchable.value;
      return `<| ${type}${printValue(value)}${printAttrs(attrs)} |>`;
    }

    case 'GapTag': {
      const { type, attrs } = matchable.value;
      return `<${type}${printAttrs(attrs)}>`;
    }

    case 'StringPattern': {
      return `'${escapeString(matchable.value)}'`;
    }

    case 'RegexPattern': {
      return matchable.value.toString();
    }

    default:
      throw new Error('unimplemented');
  }
};
