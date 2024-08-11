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
function* __resolveTerminals(ctx, terminals) {
  const co = new Coroutine(getStreamIterator(terminals));
  let languages = emptyStack;

  for (;;) {
    co.advance();

    if (co.current instanceof Promise) {
      co.current = yield co.current;
    }

    if (co.done) break;

    const terminal = co.value;

    if (terminal.type === 'DoctypeTag') {
      languages = languages.push(ctx.languages.get(terminal.value.attributes['bablr-language']));
    }

    if (terminal.type === 'CloseNodeTag') {
      languages = languages.pop();
    }

    if (terminal.type === 'OpenNodeTag') {
      if (isString(terminal.value.language)) {
        const currentLanguage = languages.value;
        const nodeLanguageURL = terminal.value.language;
        const nodeLanguage = ctx.languages.get(nodeLanguageURL);

        languages = languages.push(nodeLanguage);

        yield {
          type: 'OpenNodeTag',
          value: {
            ...terminal.value,
            language: unresolveLanguage(ctx, currentLanguage, nodeLanguageURL),
          },
        };
      } else {
        yield terminal;
      }
    } else {
      yield terminal;
    }
  }
}

export const resolveTerminals = (ctx, terminals) => {
  return new StreamIterable(__resolveTerminals(ctx, terminals));
};

export const generatePrettyCSTMLStrategy = (terminals, options = {}) => {
  const { ctx } = options;

  return generatePrettyCSTML(ctx ? resolveTerminals(ctx, terminals) : terminals, options);
};

export const printPrettyCSTML = (terminals, options = {}) => {
  return stringFromStream(generateStandardOutput(generatePrettyCSTMLStrategy(terminals, options)));
};

export const generateCSTMLStrategy = (terminals, options = {}) => {
  const { ctx } = options;

  return generateCSTML(ctx ? resolveTerminals(ctx, terminals) : terminals, options);
};

export const printCSTML = (terminals, options = {}) => {
  return stringFromStream(generateStandardOutput(generateCSTMLStrategy(terminals, options)));
};
