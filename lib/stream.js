import { Coroutine } from '@bablr/coroutine';
import {
  generatePrettyCSTML as agastGeneratePrettyCSTML,
  generateCSTML as agastGenerateCSTML,
  stringFromStream,
  getStreamIterator,
  StreamIterable,
} from '@bablr/agast-helpers/stream';
import isString from 'iter-tools-es/methods/is-string';
import emptyStack from '@iter-tools/imm-stack';
import { DoctypeTag, OpenNodeTag, CloseNodeTag } from './symbols.js';

import { unresolveLanguage } from './grammar.js';

const { freeze } = Object;

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
      languages = languages.push(ctx.languages.get(tag.value.attributes.bablrLanguage));
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

        yield freeze({
          type: OpenNodeTag,
          value: freeze({
            ...tag.value,
            language: unresolveLanguage(ctx, currentLanguage, nodeLanguageURL),
          }),
        });
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

export const generatePrettyCSTML = (tags, options = {}) => {
  const { ctx } = options;

  return agastGeneratePrettyCSTML(ctx ? resolveTags(ctx, tags) : tags, options);
};

export const printPrettyCSTML = (tags, options = {}) => {
  return stringFromStream(generatePrettyCSTML(tags, options));
};

export const generateCSTML = (tags, options = {}) => {
  const { ctx } = options;

  return agastGenerateCSTML(ctx ? resolveTags(ctx, tags) : tags, options);
};

export const printCSTML = (tags, options = {}) => {
  return stringFromStream(generateCSTML(tags, options));
};
