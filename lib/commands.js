const debug = require('debug');
const {
  eatChrs: eatChrs_,
  matchChrs: matchChrs_,
  eatMatchChrs: eatMatchChrs_,
  eatGrammar: eatGrammar_,
  matchGrammar: matchGrammar_,
  eatMatchGrammar: eatMatchGrammar_,
  eat: eat_,
  match: match_,
  eatMatch: eatMatch_,
  reference: reference_,
} = require('./symbols.js');
const { stripArray } = require('./utils.js');

const traces = debug.enabled('cst-tokens') ? true : undefined;

function* All(takeables) {
  const tokens = [];

  if (!takeables.length) {
    return null;
  }

  for (const takeable of takeables) {
    const tt = typeof takeable;
    const tokens = yield {
      type: tt === 'function' ? eatGrammar_ : tt === 'string' ? reference_ : eat_,
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
    type: eatChrs_,
    value: pattern,
    error: traces && new Error(),
  };
}

function* matchChrs(pattern) {
  return yield {
    type: matchChrs_,
    value: pattern,
    error: traces && new Error(),
  };
}

function* eatMatchChrs(pattern) {
  return yield {
    type: eatMatchChrs_,
    value: pattern,
    error: traces && new Error(),
  };
}

function* eatGrammar(generator) {
  return yield {
    type: eatGrammar_,
    value: generator,
    error: traces && new Error(),
  };
}

function* matchGrammar(generator) {
  return yield {
    type: matchGrammar_,
    value: generator,
    error: traces && new Error(),
  };
}

function* eatMatchGrammar(generator) {
  return yield {
    type: eatMatchGrammar_,
    value: generator,
    error: traces && new Error(),
  };
}

function* match(...descriptors) {
  if (!descriptors.length) {
    // continue
  } else if (descriptors.length > 1 || typeof descriptors[0] === 'function') {
    return yield {
      type: matchGrammar_,
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
      type: typeof descriptors[0] === 'string' ? reference_ : match_,
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
      type: eatMatchGrammar_,
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
      type: typeof descriptors[0] === 'string' ? reference_ : eatMatch_,
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
      type: eatGrammar_,
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
      type: typeof descriptors[0] === 'string' ? reference_ : eat_,
      value: descriptors[0],
      error: traces && new Error(),
    };
  }
}

function* reference(name) {
  return yield { type: reference_, value: name };
}

function ref(name) {
  return stripArray(name);
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
  reference,
  ref,
};
