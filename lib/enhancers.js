import { eat } from './grammar/node.js';
import { startToken, endToken } from './grammar/token.js';
import { bnd } from './shorthand.js';
import { mapProductions } from './productions.js';
import * as sym from './symbols.js';

export { mapProductions };

function* wrapTokenBounds(production, props, grammar, ...args) {
  const { type } = production;
  yield startToken(type);
  yield* production.match(props, grammar, ...args);
  yield endToken();
}

export const tokenBoundsEnhancer = (grammar) => {
  return mapProductions((production) => {
    const { type } = production;
    return {
      ...production,
      match(props, grammar, ...args) {
        if (grammar.is('Token', type)) {
          return wrapTokenBounds(production, props, grammar, ...args);
        } else {
          return production.match(props);
        }
      },
    };
  }, grammar);
};

function* wrapNodeBounds(production, props, grammar, ...args) {
  const { type } = production;
  yield eat(bnd(sym.startNode, { type }));
  yield* production.match(props, grammar, ...args);
  yield eat(bnd(sym.endNode));
}

export const nodeBoundsEnhancer = (grammar) => {
  return mapProductions((production) => {
    const { type } = production;
    return {
      ...production,
      match(props, grammar, ...args) {
        if (grammar.is('Node', type) && props.path) {
          return wrapNodeBounds(production, props, grammar, ...args);
        } else {
          return production.match(props, grammar, ...args);
        }
      },
    };
  }, grammar);
};
