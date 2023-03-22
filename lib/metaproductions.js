import { startNode, endNode } from './grammar/node.js';
import { startToken, endToken } from './grammar/token.js';

export const WithToken = (production) => {
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
};

export const WithNode = (production) => {
  const { type } = production;
  return {
    ...production,
    *match(props, grammar, ...args) {
      if (grammar.is('Node', type)) {
        yield startNode();
        yield* production.match(props, grammar, ...args);
        yield endNode();
      } else {
        yield* production.match(props, grammar, ...args);
      }
    },
  };
};
