const debug = require('debug');
const traces = debug.enabled('cst-tokens') ? true : undefined;
const { ref, Reference, LineBreak } = require('./descriptors.js');

function* branch() {
  return yield {
    type: 'branch',
    value: null,
    error: traces && new Error(),
  };
}

function* accept(state) {
  yield {
    type: 'accept',
    value: state,
    error: traces && new Error(),
  };
}

function* reject(failedCommand) {
  yield {
    type: 'reject',
    value: failedCommand,
    error: traces && new Error(),
  };
}

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
  const state = yield* branch();

  const chrs = yield* takeChrs(pattern);

  if (state.status !== 'rejected') yield* reject();

  return chrs;
}

function* matchChrs(pattern) {
  const state = yield* branch();

  const chrs = yield* takeChrs(pattern);

  if (chrs) yield* accept(state);

  return chrs;
}

function* takeChrs(pattern) {
  return yield {
    type: 'takeChrs',
    value: pattern,
    error: traces && new Error(),
  };
}

function* delegate(generator) {
  return yield {
    type: 'delegate',
    value: generator,
    error: traces && new Error(),
  };
}

function* test(...descriptors) {
  const state = yield* branch();

  const tokens = yield* take(...descriptors);

  if (state.status !== 'rejected') yield* reject(state);

  return tokens;
}

function* match(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    const state = yield* branch();

    const tokens = yield* take(...descriptors);

    if (tokens) yield* accept(state);
    return tokens;
  } else {
    return yield {
      type: 'match',
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* take(...descriptors) {
  const tokens = [];

  for (const descriptor of descriptors) {
    const command = {
      type: typeof descriptor === 'function' ? 'delegate' : 'take',
      value: descriptor,
      error: traces && new Error(),
    };
    const tokens_ = yield command;

    if (tokens_) {
      tokens.push(...tokens_);
    } else {
      return null;
    }
  }

  return tokens;
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
  ref,
  Reference,
  LineBreak,
  branch,
  accept,
  reject,
  emit,
  testChrs,
  matchChrs,
  takeChrs,
  delegate,
  test,
  match,
  take,
  eat,
  eatMatch,
};
