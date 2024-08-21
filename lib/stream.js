import { Coroutine } from '@bablr/coroutine';
import {
  generatePrettyCSTMLStrategy as generatePrettyCSTML,
  generateCSTMLStrategy as generateCSTML,
  stringFromStream,
  generateStandardOutput,
  getStreamIterator,
  StreamIterable,
} from '@bablr/agast-helpers/stream';
import isString from 'iter-tools-es/methods/is-string';
import emptyStack from '@iter-tools/imm-stack';

import { unresolveLanguage } from './grammar.js';

// bad: wrecks tree by breaking weak linkages
function* __resolveTags(ctx, Tags) {
  const co = new Coroutine(getStreamIterator(Tags));
  let languages = emptyStack;

  for (;;) {
    co.advance();

    if (co.current instanceof Promise) {
      co.current = yield co.current;
    }

    if (co.done) break;

    const Tag = co.value;

    if (Tag.type === 'DoctypeTag') {
      languages = languages.push(ctx.languages.get(Tag.value.attributes['bablr-language']));
    }

    if (Tag.type === 'CloseNodeTag') {
      languages = languages.pop();
    }

    if (Tag.type === 'OpenNodeTag') {
      if (isString(Tag.value.language)) {
        const currentLanguage = languages.value;
        const nodeLanguageURL = Tag.value.language;
        const nodeLanguage = ctx.languages.get(nodeLanguageURL);

        languages = languages.push(nodeLanguage);

        yield {
          type: 'OpenNodeTag',
          value: {
            ...Tag.value,
            language: unresolveLanguage(ctx, currentLanguage, nodeLanguageURL),
          },
        };
      } else {
        yield Tag;
      }
    } else {
      yield Tag;
    }
  }
}

export const resolveTags = (ctx, Tags) => {
  return new StreamIterable(__resolveTags(ctx, Tags));
};

export const generatePrettyCSTMLStrategy = (Tags, options = {}) => {
  const { ctx } = options;

  return generatePrettyCSTML(ctx ? resolveTags(ctx, Tags) : Tags, options);
};

export const printPrettyCSTML = (Tags, options = {}) => {
  return stringFromStream(generateStandardOutput(generatePrettyCSTMLStrategy(Tags, options)));
};

export const generateCSTMLStrategy = (Tags, options = {}) => {
  const { ctx } = options;

  return generateCSTML(ctx ? resolveTags(ctx, Tags) : Tags, options);
};

export const printCSTML = (Tags, options = {}) => {
  return stringFromStream(generateStandardOutput(generateCSTMLStrategy(Tags, options)));
};
