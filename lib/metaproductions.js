import { eat, startToken, endToken } from './grammar.js';
import { tok } from './shorthand.js';
import { StartNode, EndNode, rejected } from './symbols.js';

export const WithToken = ([key, production]) => {
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
          const { getState } = props;
          yield eat(tok(StartNode));

          yield* production(props, grammar, ...args);

          if (getState().status !== rejected) {
            yield eat(tok(EndNode));
          }
        } else {
          yield* production(props, grammar, ...args);
        }
      },
    }[name],
  ];
};

const formatType = (type) => {
  return typeof type === 'symbol' ? `[${type.description.replace(/^cst-tokens\//, '')}]` : type;
};

export const WithLogging = ([type, production]) => {
  const name = `WithLogging_${production.name}`;
  return [
    type,
    {
      *[name](...args) {
        console.log(`--> ${formatType(type)}`);

        let normalCompletion = false;
        try {
          for (const instr of production(...args)) {
            const formattedVerb = instr.type ? ` ${formatType(instr.type)}` : '<unknown>';
            const edible = instr.value;
            const formattedMode = edible ? ` ${formatType(edible.type)}` : '';
            const descriptor = edible?.value;
            const formattedDescriptor = descriptor ? ` ${formatType(descriptor.type)}` : '';

            console.log(`instr ${formatType(formattedVerb)}${formattedMode}${formattedDescriptor}`);

            yield instr;
          }
          normalCompletion = true;
        } finally {
          if (normalCompletion) {
            console.log(`<-- ${formatType(type)}`);
          } else {
            console.log(`x-- ${formatType(type)}`);
          }
        }
      },
    }[name],
  ];
};
