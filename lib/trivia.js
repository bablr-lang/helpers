import { getCooked } from './token.js';
import { mapProductions } from './enhancers.js';
import { Coroutine } from './grammar.js';

const lookbehind = (context, s) => {
  let token = s.result;
  while (['OpenNode', 'CloseNode', 'OpenFragment', 'ReferenceTag'].includes(token.type)) {
    const prevToken = context.getPreviousTerminal(token);
    if (!prevToken) break;
    token = prevToken;
  }
  return token;
};

// eslint-disable-next-line no-undef
const matchedResults = new WeakSet();

export const triviaEnhancer = ({ triviaIsAllowed, eatMatchTrivia }, grammar) => {
  return mapProductions((production) => {
    return function* (props, s, ctx, ...args) {
      const co = new Coroutine(production(props, s, ctx, ...args));

      co.advance();

      let isTerminal = false;

      try {
        while (!co.done) {
          const instr = co.value;
          let returnValue = undefined;

          const {
            verb: verbToken,
            verbSuffix: verbSuffixToken,
            arguments: {
              properties: { values: { 0: matcher } = [] },
            },
          } = instr.properties;
          const verb = getCooked(verbToken);
          const verbSuffix = verbSuffixToken && getCooked(verbSuffixToken);

          switch (verb) {
            case 'eat':
            case 'eatMatch':
            case 'match':
            case 'guard': {
              if (verbSuffix !== '#') {
                const previous = lookbehind(ctx, s);
                if (triviaIsAllowed(s) && !matchedResults.has(previous)) {
                  matchedResults.add(previous);
                  yield eatMatchTrivia;
                  matchedResults.add(s.result);
                }
                if (['String', 'Pattern'].includes(matcher.type)) {
                  isTerminal = true;
                }
              }

              returnValue = returnValue || (yield instr);
              break;
            }

            default:
              returnValue = yield instr;
              break;
          }

          co.advance(returnValue);
        }

        if (!isTerminal) {
          const previous = lookbehind(ctx, s);
          if (triviaIsAllowed(s) && !matchedResults.has(previous)) {
            matchedResults.add(previous);
            yield eatMatchTrivia;
            matchedResults.add(s.result);
          }
        }

        return co.value;
      } catch (e) {
        co.throw(e);
        throw e;
      }
    };
  }, grammar);
};
