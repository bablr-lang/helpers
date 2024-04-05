export function* sourceFromStream(terminals) {
  for (const terminal of terminals) {
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

export function* fillGapsWith(expressions, stream) {
  let i = 0;
  for (const token of stream) {
    if (token.type === 'Gap') {
      if (i >= expressions.length) throw new Error('not enough gaps for expressions');
      yield expressions[i];
    } else {
      yield token;
    }
  }
  if (i !== expressions.length) {
    throw new Error('too many expressions for gaps');
  }
}
