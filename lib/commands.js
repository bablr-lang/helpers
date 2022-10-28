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
  startNode: startNode_,
  endNode: endNode_,
} = require('./symbols.js');
const { stripArray } = require('./utils.js');

const traces = debug.enabled('cst-tokens') ? true : undefined;

function* All(takeables) {
  if (!takeables.length) {
    return;
  }

  for (const takeable of takeables) {
    const tt = typeof takeable;
    yield {
      type: tt === 'function' ? eatGrammar_ : tt === 'string' ? reference_ : eat_,
      value: takeable,
      error: traces && new Error(),
    };
  }
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

function* match(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: matchGrammar_,
      value:
        takeables.length > 1
          ? function All() {
              return All_(takeables);
            }
          : takeables[0],
      error: traces && new Error(),
    };
  } else {
    const token = yield {
      type: typeof takeables[0] === 'string' ? reference_ : match_,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

function* eatMatch(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: eatMatchGrammar_,
      value:
        takeables.length > 1
          ? function All() {
              return All_(takeables);
            }
          : takeables[0],
      error: traces && new Error(),
    };
  } else {
    const token = yield {
      type: typeof takeables[0] === 'string' ? reference_ : eatMatch_,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

function* eat(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: eatGrammar_,
      value:
        takeables.length > 1
          ? function All() {
              return All_(takeables);
            }
          : takeables[0],
      error: traces && new Error(),
    };
  } else {
    const token = yield {
      type: typeof takeables[0] === 'string' ? reference_ : eat_,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

function* reference(name) {
  return yield { type: reference_, value: name };
}

function* startNode(name) {
  return yield { type: startNode_, value: name };
}

function* endNode(name) {
  return yield { type: endNode_, value: name };
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
  startNode,
  endNode,
  ref,
};
