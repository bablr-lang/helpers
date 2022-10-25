const debug = require('debug');

const traces = debug.enabled('cst-tokens') ? true : undefined;

function* All(takeables) {
  const tokens = [];

  if (!takeables.length) {
    return null;
  }

  for (const takeable of takeables) {
    const tokens = yield {
      type: typeof takeable === 'function' ? 'eatGrammar' : 'eat',
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

function* eatChrs(pattern) {
  return yield {
    type: 'eatChrs',
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

function* eatMatchChrs(pattern) {
  return yield {
    type: 'eatMatchChrs',
    value: pattern,
    error: traces && new Error(),
  };
}

function* eatGrammar(generator) {
  return yield {
    type: 'eatGrammar',
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

function* eatMatchGrammar(generator) {
  return yield {
    type: 'eatMatchGrammar',
    value: generator,
    error: traces && new Error(),
  };
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

function* eatMatch(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: 'eatMatchGrammar',
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
      type: 'eatMatch',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* eat(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: 'eatGrammar',
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
      type: 'eat',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

module.exports = {
  eatChrs,
  matchChrs,
  eatMatchChrs,
  eatGrammar,
  matchGrammar,
  eatMatchGrammar,
  eat,
  match,
  eatMatch,
};
