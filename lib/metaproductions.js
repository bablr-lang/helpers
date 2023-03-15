import { startToken, endToken, startNode, endNode } from './grammar.js';

export const WithToken = ([key, production = null]) => {
  const name = `WithToken_${production.name}`;
  return [
    key,
    {
      *[name](props, grammar, ...args) {
        if (grammar.is('Token', key)) {
          yield startToken(key);
          yield* production(props, grammar, ...args);
          yield endToken();
        } else {
          yield* production(props, grammar, ...args);
        }
      },
    }[name],
  ];
};

export const WithNode = ([type, production]) => {
  const name = `WithNode_${production.name}`;
  return [
    type,
    {
      *[name](props, grammar, ...args) {
        if (grammar.is('Node', type)) {
          yield startNode();
          yield* production(props, grammar, ...args);
          yield endNode();
        } else {
          yield* production(props, grammar, ...args);
        }
      },
    }[name],
  ];
};
