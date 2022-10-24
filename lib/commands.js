const debug = require('debug');

const traces = debug.enabled('cst-tokens') ? true : undefined;

function* All(takeables) {
  const tokens = [];

  if (!takeables.length) {
    return null;
  }

  for (const takeable of takeables) {
    const tokens = yield {
      type: typeof takeable === 'function' ? 'takeGrammar' : 'take',
      value: takeable,
      error: traces && new Error(),
    };

    if (!tokens) {
      return null;
    }

    tokens.push(...tokens);
  }

  return tokens;
}

const All_ = All;

function* emit(tokens) {
  if (tokens !== null) {
    yield {
      type: 'emit',
      value: tokens,
      error: traces && new Error(),
    };
  }
}

function* testChrs(pattern) {
  return yield {
    type: 'testChrs',
    value: pattern,
    error: traces && new Error(),
  };
}

function* matchChrs(pattern) {
  return yield {
    type: 'matchChrs',
    value: pattern,
    error: traces && new Error(),
  };
}

function* takeChrs(pattern) {
  return yield {
    type: 'takeChrs',
    value: pattern,
    error: traces && new Error(),
  };
}

function* testGrammar(generator) {
  return yield {
    type: 'testGrammar',
    value: generator,
    error: traces && new Error(),
  };
}

function* matchGrammar(generator) {
  return yield {
    type: 'matchGrammar',
    value: generator,
    error: traces && new Error(),
  };
}

function* takeGrammar(generator) {
  return yield {
    type: 'takeGrammar',
    value: generator,
    error: traces && new Error(),
  };
}

function* test(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: 'testGrammar',
      value:
        descriptors.length > 1
          ? function All() {
              return All_(descriptors);
            }
          : descriptors[0],
      error: traces && new Error(),
    };
  } else {
    return yield {
      type: 'test',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* match(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: 'matchGrammar',
      value:
        descriptors.length > 1
          ? function All() {
              return All_(descriptors);
            }
          : descriptors[0],
      error: traces && new Error(),
    };
  } else {
    return yield {
      type: 'match',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* take(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: 'takeGrammar',
      value:
        descriptors.length > 1
          ? function All() {
              return All_(descriptors);
            }
          : descriptors[0],
      error: traces && new Error(),
    };
  } else {
    return yield {
      type: 'take',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* eat(...descriptors) {
  const tokens = yield* take(...descriptors);

  if (tokens) yield* emit(tokens);

  return tokens;
}

function* eatMatch(...descriptors) {
  const tokens = yield* match(...descriptors);

  if (tokens) yield* emit(tokens);

  return tokens;
}

module.exports = {
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  testGrammar,
  matchGrammar,
  takeGrammar,
  test,
  match,
  take,
  eat,
  eatMatch,
};
