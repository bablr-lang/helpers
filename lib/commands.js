import debug from 'debug';

import * as sym from './symbols.js';

const traces = debug.enabled('cst-tokens') ? true : undefined;

export function* All(takeables) {
  if (!takeables.length) {
    return;
  }

  for (const takeable of takeables) {
    const tt = typeof takeable;
    const token = yield {
      type: tt === 'function' ? sym.eatProduction : tt === 'string' ? sym.reference : sym.eat,
      value: takeable,
      error: traces && new Error(),
    };
    if (!token) break;
  }
}

const All_ = All;

export function* eatChrs(pattern) {
  return yield {
    type: sym.eatChrs,
    value: pattern,
    error: traces && new Error(),
  };
}

export function* matchChrs(pattern) {
  return yield {
    type: sym.matchChrs,
    value: pattern,
    error: traces && new Error(),
  };
}

export function* eatMatchChrs(pattern) {
  return yield {
    type: sym.eatMatchChrs,
    value: pattern,
    error: traces && new Error(),
  };
}

export function* eatProduction(generator) {
  return yield {
    type: sym.eatProduction,
    value: generator,
    error: traces && new Error(),
  };
}

export function* matchProduction(generator) {
  return yield {
    type: sym.matchProduction,
    value: generator,
    error: traces && new Error(),
  };
}

export function* eatMatchProduction(generator) {
  return yield {
    type: sym.eatMatchProduction,
    value: generator,
    error: traces && new Error(),
  };
}

export function* match(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: sym.matchProduction,
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
      type: typeof takeables[0] === 'string' ? sym.reference : sym.match,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

export function* eatMatch(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: sym.eatMatchProduction,
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
      type: typeof takeables[0] === 'string' ? sym.reference : sym.eatMatch,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

export function* eat(...takeables) {
  if (!takeables.length) {
    // continue
  } else if (takeables.length > 1 || typeof takeables[0] === 'function') {
    return yield {
      type: sym.eatProduction,
      value:
        takeables.length > 1
          ? function All() {
              return All_(takeables);
            }
          : takeables[0],
      error: traces && new Error(),
    };

    // I intend to enable this optimization eventually
    // For now the slow way helps me see dangerous edge cases more often!

    // for (const takeable of takeables) {
    //   typeof takeables[0] === 'string'
    //     ? yield* reference(takeable)
    //     : yield {
    //         type: tt === 'function' ? sym.eatProduction : sym.eat,
    //         value: takeable,
    //         error: traces && new Error(),
    //       };
    // }
  } else {
    const token = yield {
      type: typeof takeables[0] === 'string' ? sym.reference : sym.eat,
      value: takeables[0],
      error: traces && new Error(),
    };
    return token && [token];
  }
}

export function* reference(name) {
  return yield { type: sym.reference, value: name, error: traces && new Error() };
}

export function* startNode(depth) {
  return yield { type: sym.startNode, value: depth, error: traces && new Error() };
}

export function* endNode(depth) {
  return yield { type: sym.endNode, value: depth, error: traces && new Error() };
}
