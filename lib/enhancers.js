import { startNode, endNode } from './grammar/node.js';
import { startToken, endToken } from './grammar/token.js';
import { mapProductions } from './productions.js';

export { mapProductions };

export const tokenBoundsEnhancer = (grammar) => {
  return mapProductions((production) => {
    const { type } = production;
    return {
      ...production,
      *match(props, grammar, ...args) {
        if (grammar.is('Token', type)) {
          yield startToken(type);
          yield* production.match(props, grammar, ...args);
          yield endToken();
        } else {
          yield* production.match(props, grammar, ...args);
        }
      },
    };
  }, grammar);
};

export const nodeBoundsEnhancer = (grammar) => {
  return mapProductions((production) => {
    const { type } = production;
    return {
      ...production,
      *match(props, grammar, ...args) {
        if (grammar.is('Node', type) && props.path) {
          yield startNode(type);
          yield* production.match(props, grammar, ...args);
          yield endNode();
        } else {
          yield* production.match(props, grammar, ...args);
        }
      },
    };
  }, grammar);
};
