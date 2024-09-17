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
import { DoctypeTag, OpenNodeTag, CloseNodeTag } from './symbols.js';

import { unresolveLanguage } from './grammar.js';

// bad: wrecks tree by breaking weak linkages
function* __resolveTags(ctx, tags) {
  const co = new Coroutine(getStreamIterator(tags));
  let languages = emptyStack;

  for (;;) {
    co.advance();

    if (co.current instanceof Promise) {
      co.current = yield co.current;
    }

    if (co.done) break;

    const tag = co.value;

    if (tag.type === DoctypeTag) {
      languages = languages.push(ctx.languages.get(tag.value.attributes['bablr-language']));
    }

    if (tag.type === CloseNodeTag) {
      languages = languages.pop();
    }

    if (tag.type === OpenNodeTag) {
      if (isString(tag.value.language)) {
        const currentLanguage = languages.value;
        const nodeLanguageURL = tag.value.language;
        const nodeLanguage = ctx.languages.get(nodeLanguageURL);

        languages = languages.push(nodeLanguage);

        yield {
          type: OpenNodeTag,
          value: {
            ...tag.value,
            language: unresolveLanguage(ctx, currentLanguage, nodeLanguageURL),
          },
        };
      } else {
        yield tag;
      }
    } else {
      yield tag;
    }
  }
}

export const resolveTags = (ctx, tags) => {
  return new StreamIterable(__resolveTags(ctx, tags));
};

export const generatePrettyCSTMLStrategy = (tags, options = {}) => {
  const { ctx } = options;

  return generatePrettyCSTML(ctx ? resolveTags(ctx, tags) : tags, options);
};

export const printPrettyCSTML = (tags, options = {}) => {
  return stringFromStream(generateStandardOutput(generatePrettyCSTMLStrategy(tags, options)));
};

export const generateCSTMLStrategy = (tags, options = {}) => {
  const { ctx } = options;

  return generateCSTML(ctx ? resolveTags(ctx, tags) : tags, options);
};

export const printCSTML = (tags, options = {}) => {
  return stringFromStream(generateStandardOutput(generateCSTMLStrategy(tags, options)));
};
