import slice from 'iter-tools-es/methods/slice';
import { streamFromTree } from '@bablr/agast-helpers/tree';

export const sourceFromReadStream = (stream) => new MixedGenerator(__sourceFromReadStream(stream));

const escapables = {
  n: '\n',
  r: '\r',
  t: '\t',
  0: '\0',
};

function* __readStreamAsMixedIterator(stream) {
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

const readStreamAsMixedIterator = (stream) =>
  new MixedGenerator(__readStreamAsMixedIterator(stream));

const gapStr = '<//>';

function* __sourceFromReadStream(stream) {
  let iter = readStreamAsMixedIterator(stream);
  let step;
  let literal = false;
  let escape = false;
  let gapMatchIdx = 0;

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
      if (!literal && chr === gapStr[gapMatchIdx]) {
        gapMatchIdx++;
        if (gapMatchIdx === gapStr.length) {
          yield null;
          gapMatchIdx = 0;
        }
      } else if (chr === "'" || chr === '"') {
        literal = !literal;
      } else if (literal && chr === '\\') {
        escape = true;
      } else if (literal) {
        yield chr;
      }
    }
  }

  if (!step.done) {
    iter?.return();
  }
}

export function* sourceFromSyncTokenStream(terminals) {
  for (const terminal of terminals) {
    if (terminal.type === 'Literal') {
      yield* terminal.value;
    } else if (terminal.type === 'Gap') {
      yield null;
    }
  }
}

export async function* sourceFromAsyncTokenStream(terminals) {
  for await (const terminal of terminals) {
    if (terminal.type === 'Literal') {
      yield* terminal.value;
    } else if (terminal.type === 'Gap') {
      yield null;
    }
  }
}

export function* sourceFromQuasis(quasis) {
  let first = true;

  for (const quasi of quasis) {
    if (!first) yield null;
    yield* quasi;
    first = false;
  }
}

const mixedSymbols = [Symbol.iterator, Symbol.for('@@mixedIterator'), Symbol.asyncIterator];

export const getMixedIterator = (obj) => {
  for (const symbol of mixedSymbols) {
    if (obj[symbol]) return obj[symbol]();
  }
};

export function* fillGapsWith(expressions, stream) {
  let exprIdx = 0;

  for (const token of stream) {
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

export class MixedGenerator {
  constructor(embeddedGenerator) {
    this.generator = embeddedGenerator;
  }

  next(value) {
    const step = this.generator.next(value);

    if (step.done) {
      return { value: undefined, done: true };
    } else if (step.value instanceof Promise) {
      return step.value.then((value) => {
        return this.next(value);
      });
    } else {
      const { value } = step;
      return { value, done: false };
    }
  }

  return(value) {
    return this.generator.return(value);
  }

  [Symbol.for('@@mixedIterator')]() {
    return this;
  }
}
