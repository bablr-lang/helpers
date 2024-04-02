import { Coroutine } from '@bablr/coroutine';
import { reifyExpression } from '@bablr/agast-vm-helpers';
import { mapProductions } from './enhancers.js';

const lookbehind = (context, s) => {
  let token = s.result;
  while (
    token &&
    ['OpenNodeTag', 'CloseNodeTag', 'OpenFragmentTag', 'Reference'].includes(token.type)
  ) {
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

      try {
        while (!co.done) {
          const sourceInstr = co.value;
          const instr = reifyExpression(sourceInstr);
          const { verb, arguments: { 0: matcher } = [] } = instr;
          let returnValue = undefined;

          switch (verb) {
            case 'eat':
            case 'eatMatch':
            case 'match':
            case 'guard': {
              if (matcher && matcher.type && !matcher.flags.trivia) {
                const previous = lookbehind(ctx, s);
                if (triviaIsAllowed(s) && (!previous || !matchedResults.has(previous))) {
                  matchedResults.add(previous);
                  yield* eatMatchTrivia();
                  matchedResults.add(s.result);
                }
              }

              returnValue = returnValue || (yield sourceInstr);
              break;
            }

            default:
              returnValue = yield sourceInstr;
              break;
          }

          co.advance(returnValue);
        }

        if (!s.path?.isToken) {
          const previous = lookbehind(ctx, s);
          if (triviaIsAllowed(s) && !matchedResults.has(previous)) {
            matchedResults.add(previous);
            yield* eatMatchTrivia();
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
