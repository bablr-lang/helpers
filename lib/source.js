import slice from 'iter-tools-es/methods/slice';
import { streamFromTree } from '@bablr/agast-helpers/tree';
import { StreamIterable, getStreamIterator } from '@bablr/agast-helpers/stream';
import { ShiftTag, GapTag, LiteralTag } from './symbols.js';

const escapables = {
  n: '\n',
  r: '\r',
  t: '\t',
  0: '\0',
};

function* __readFromStream(stream) {
  let iter = stream[Symbol.asyncIterator]();
  let step;

  for (;;) {
    step = yield iter.next();

    if (step.done) break;

    yield* step.value;
  }

  if (!step.done) {
    iter?.return();
  }
}

export const readFromStream = (stream) => new StreamIterable(__readFromStream(stream));

const gapStr = '<//>';

function* __embeddedSourceFrom(iterable) {
  let iter = getStreamIterator(iterable);
  let step;
  let escape = false;
  let gapMatchIdx = 0;
  let quote = null;

  for (;;) {
    step = iter.next();

    if (step instanceof Promise) {
      step = yield step;
    }

    if (step.done) break;

    const chr = step.value;

    if (escape) {
      if (chr === "'" || chr === '"' || chr === '\\') {
        yield chr;
      } else if (escapables[chr]) {
        yield escapables[chr];
      } else {
        throw new Error();
      }
      escape = false;
    } else {
      if (!quote && chr === gapStr[gapMatchIdx]) {
        gapMatchIdx++;
        if (gapMatchIdx === gapStr.length) {
          yield null;
          gapMatchIdx = 0;
        }
      } else {
        if (gapMatchIdx > 0) {
          throw new Error();
        }

        if (!quote && (chr === '"' || chr === "'")) {
          quote = chr;
        } else if (quote && chr === quote) {
          quote = null;
        } else if (quote && chr === '\\') {
          escape = true;
        } else if (quote) {
          yield chr;
        } else if (!/[\s]/.test(chr)) {
          throw new Error('unkown syntax');
        }
      }
    }
  }

  if (!step.done) {
    iter?.return();
  }
}

export const embeddedSourceFrom = (iterable) => new StreamIterable(__embeddedSourceFrom(iterable));

function* __printEmbeddedSource(chrs) {
  let iter = getStreamIterator(chrs);
  let part = '';

  let step;
  for (;;) {
    step = iter.next();

    if (step instanceof Promise) {
      step = yield step;
    }

    if (step.done) break;

    const chr = step.value;

    if (chr === null) {
      if (part) {
        yield `'`;
        yield* part;
        yield `'<//>`;

        part = '';
      }
    } else if (chr === '\\' || chr === "'") {
      part += `\\${chr}`;
    } else {
      part += chr;
    }
  }

  if (part) {
    yield `'`;
    yield* part;
    yield `'`;
  }
}

export const printEmbeddedSource = (chrs) => {
  return __printEmbeddedSource(chrs);
};

function* __sourceFromTokenStream(tags) {
  let iter = getStreamIterator(tags);
  let step;

  for (;;) {
    step = iter.next();

    if (step instanceof Promise) {
      yield step;
    }

    if (step.done) break;

    const tag = step.value;

    if (tag.type === LiteralTag) {
      yield* tag.value;
    } else if (tag.type === GapTag) {
      yield null;
    }
  }
}

export const sourceFromTokenStream = (tags) => new StreamIterable(__sourceFromTokenStream(tags));

function* __sourceFromQuasis(quasis) {
  let first = true;
  let iter = getStreamIterator(quasis) || quasis[Symbol.iterator]();
  let step;

  for (;;) {
    step = iter.next();

    if (step instanceof Promise) {
      step = yield step;
    }

    if (step.done) break;

    const quasi = step.value;

    if (!first) yield null;
    yield* quasi;
    first = false;
  }
}

export const sourceFromQuasis = (quasis) => new StreamIterable(__sourceFromQuasis(quasis));

export function* fillGapsWith(expressions, iterable) {
  let exprIdx = 0;
  let iter = getStreamIterator(iterable);
  let holding = false;

  for (;;) {
    let step = iter.next();

    if (step instanceof Promise) {
      step = yield step;
    }

    if (step.done) break;

    const token = step.value;

    if (token.type === ShiftTag) {
      holding = true;
    }

    if (token.type === GapTag) {
      if (holding) {
        holding = false;
        yield token;
      } else {
        if (exprIdx >= expressions.length) throw new Error('not enough gaps for expressions');
        yield* slice(2, -1, streamFromTree(expressions[exprIdx]));
        exprIdx++;
      }
    } else {
      yield token;
    }
  }

  if (exprIdx !== expressions.length) {
    throw new Error('too many expressions for gaps');
  }
}

const none = Symbol('none');

function* __stripTrailingNewline(iterable) {
  const iter = getStreamIterator(iterable);
  let step = iter.next();
  let lastValue = none;

  for (;;) {
    if (step instanceof Promise) {
      step = yield step;
    }

    // TODO: handle \r\n line endings
    if (step.done && lastValue === '\n') {
      return;
    }

    if (lastValue !== none) {
      yield lastValue;
    }

    if (step.done) break;

    lastValue = step.value;

    step = iter.next();
  }

  if (lastValue !== none) {
    yield lastValue;
  }
}

export const stripTrailingNewline = (iterable) =>
  new StreamIterable(__stripTrailingNewline(iterable));
