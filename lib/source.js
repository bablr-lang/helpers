import slice from 'iter-tools-es/methods/slice';
import { streamFromTree } from '@bablr/agast-helpers/tree';
import { StreamIterable, getStreamIterator } from '@bablr/agast-helpers/stream';

const escapables = {
  n: '\n',
  r: '\r',
  t: '\t',
  0: '\0',
};

function* __readStreamAsStreamIterator(stream) {
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

const readStreamAsStreamIterator = (stream) =>
  new StreamIterable(__readStreamAsStreamIterator(stream));

const gapStr = '<//>';

function* __sourceFromReadStream(stream) {
  let iter = getStreamIterator(readStreamAsStreamIterator(stream));
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

export const sourceFromReadStream = (stream) => new StreamIterable(__sourceFromReadStream(stream));

function* __sourceFromTokenStream(terminals) {
  let iter = getStreamIterator(terminals);
  let step;

  for (;;) {
    step = iter.next();

    if (step instanceof Promise) {
      yield step;
    }

    if (step.done) break;

    const terminal = step.value;

    if (terminal.type === 'Literal') {
      yield* terminal.value;
    } else if (terminal.type === 'Gap') {
      yield null;
    }
  }
}

export const sourceFromTokenStream = (terminals) =>
  new StreamIterable(__sourceFromTokenStream(terminals));

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

export function* fillGapsWith(expressions, stream) {
  let exprIdx = 0;
  let iter = getStreamIterator(stream);
  let step;

  for (;;) {
    let step = iter.next();

    if (step instanceof Promise) {
      step = yield step;
    }

    if (step.done) break;

    const token = step.value;

    if (token.type === 'Gap') {
      if (exprIdx >= expressions.length) throw new Error('not enough gaps for expressions');
      yield* slice(2, -1, streamFromTree(expressions[exprIdx]));
      exprIdx++;
    } else {
      yield token;
    }
  }

  if (exprIdx !== expressions.length) {
    throw new Error('too many expressions for gaps');
  }
}
