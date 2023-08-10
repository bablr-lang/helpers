import { Grammar } from '@bablr/grammar';
import { productions } from './productions.js';
import { concat } from './iterable.js';
import { objectEntries } from './object.js';

const _ = /[ \t]+/y;

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
        return p.eatProduction('String');
      } else if (p.match('/')) {
        return p.eatProduction('Regex');
      } else {
        throw new Error(`Unexpected character ${p.chr}`);
      }
    },

    Tag(p) {
      if (p.match('<|[')) {
        throw new Error('gap token syntax is illegal in grammar definitions');
      } else if (p.match('<|') || p.match('<|+') || p.match('<| |>')) {
        return p.eatProduction('GapTokenTag');
      } else if (p.match('<!')) {
        throw new Error('doctype tag syntax is illegal in grammar definitions');
      } else if (p.match('</')) {
        throw new Error('close tag syntax is illegal in grammar definitions');
      } else if (p.match('<[')) {
        throw new Error('gap tag syntax is illegal in grammar definitions');
      } else if (p.match('<+') || p.match(/<(?:\w|$)/y)) {
        return p.eatProduction('GapNodeTag');
      } else {
        throw new Error(`Unexpected character ${p.chr}`);
      }
    },

    BooleanTokenTag(p) {
      p.eat('<|+');
      p.eatMatch(_);

      const type = p.eat(/\w+/y);

      let sp = p.eatMatch(_);

      const matchables = [];

      while (sp && !p.match('|>')) {
        matchables.push(p.eatProduction('Matchable'));
        sp = p.eatMatch(_);
      }

      p.eat('|>');

      return { type, value: undefined, attrs: new Map([['matchables', matchables]]) };
    },

    GapTokenTag(p) {
      if (p.match('<| |>')) {
        return { type: 'Trivia', value: undefined, attrs: new Map() };
      }

      if (p.match('<|+')) {
        return p.eatProduction('BooleanTokenTag');
      }

      p.eat('<|');
      p.eatMatch(_);

      const type = p.eat(/\w+/y);

      let sp = p.eatMatch(_);

      let value = null;
      if (sp && /['"]/y.test(p.chr)) {
        value = p.eatProduction('String');
      } else if (sp && p.chr === '/') {
        value = p.eatProduction('Regex');
      }

      sp = value ? p.eatMatch(_) : sp;

      const attrs = sp ? p.eatProduction('Attributes') : [];

      p.eatMatch(_);

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

    BooleanNodeTag(p) {
      p.eat('<+');
      p.eatMatch(_);

      const type = p.eat(/\w+/y);

      let sp = p.eatMatch(_);

      const matchables = [];

      while (sp) {
        matchables.push(p.eatProduction('Tag'));
        sp = p.eatMatch(_);
      }

      p.eat('>');

      return { type, value: undefined, attrs: new Map([['matchables', matchables]]) };
    },

    GapNodeTag(p) {
      if (p.match('<+')) {
        return p.eatProduction('BooleanNodeTag');
      }

      p.eat('<');

      const type = p.eatProduction('Identifier');

      const sp = p.eatMatch(_);

      const attrs = sp ? p.eatProduction('Attributes') : [];

      p.eatMatch(_);

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
        sp = p.eatMatch(_);
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
      p.eatMatch(_);
      p.eat('=');
      p.eatMatch(_);
      const value = p.eatProduction('Matchable');

      return [key, value];
    },
  }),

  aliases: objectEntries({
    Node: ['GapNodeTag', 'GapTokenTag', 'Regex', 'StringPattern'],
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
    case 'GapTokenTag': {
      const { type, value, attrs } = matchable.value;
      return `<| ${type}${printValue(value)}${printAttrs(attrs)} |>`;
    }

    case 'GapNodeTag': {
      const { type, attrs } = matchable.value;
      return `<${type}${printAttrs(attrs)}>`;
    }

    case 'StringPattern': {
      return `'${escapeString(matchable.value)}'`;
    }

    case 'Regex': {
      return matchable.value.toString();
    }

    default:
      throw new Error('unimplemented');
  }
};
