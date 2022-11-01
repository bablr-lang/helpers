const debug = require('debug');
const {
  eatChrs: eatChrs_,
  matchChrs: matchChrs_,
  eatMatchChrs: eatMatchChrs_,
  eatFragment: eatFragment_,
  matchFragment: matchFragment_,
  eatMatchFragment: eatMatchFragment_,
  eat: eat_,
  match: match_,
  eatMatch: eatMatch_,
  reference: reference_,
  startNode: startNode_,
  endNode: endNode_,
} = require('./symbols.js');

const traces = debug.enabled('cst-tokens') ? true : undefined;

function* All(takeables) {
  if (!takeables.length) {
    return;
  }

  for (const takeable of takeables) {
    const tt = typeof takeable;
    const token = yield {
      type: tt === 'function' ? eatFragment_ : tt === 'string' ? reference_ : eat_,
      value: takeable,
      error: traces && new Error(),
    };
    if (!token) break;
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

function* eatFragment(generator) {
  return yield {
    type: eatFragment_,
    value: generator,
    error: traces && new Error(),
  };
}

function* matchFragment(generator) {
  return yield {
    type: matchFragment_,
    value: generator,
    error: traces && new Error(),
  };
}

function* eatMatchFragment(generator) {
  return yield {
    type: eatMatchFragment_,
    value: generator,
    error: traces && new Error(),
  };
}

function* match(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: matchFragment_,
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
      type: eatMatchFragment_,
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
      type: eatFragment_,
      value:
        takeables.length > 1
          ? function All() {
              return All_(takeables);
            }
          : takeables[0],
      error: traces && new Error(),
    };

    // for (const takeable of takeables) {
    //   const tt = typeof takeable;
    //   yield {
    //     type: tt === 'function' ? eatFragment_ : tt === 'string' ? reference_ : eat_,
    //     value: takeable,
    //     error: traces && new Error(),
    //   };
    // }
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
  return yield { type: reference_, value: name, error: traces && new Error() };
}

function* startNode(name) {
  return yield { type: startNode_, value: name, error: traces && new Error() };
}

function* endNode(name) {
  return yield { type: endNode_, value: name, error: traces && new Error() };
}

module.exports = {
  eatChrs,
  matchChrs,
  eatMatchChrs,
  eatFragment,
  matchFragment,
  eatMatchFragment,
  eat,
  match,
  eatMatch,
  reference,
  startNode,
  endNode,
};
