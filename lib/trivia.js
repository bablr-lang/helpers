import { Coroutine } from '@bablr/coroutine';
import { reifyExpression } from '@bablr/agast-vm-helpers';
import { mapProductions } from './grammar.js';
import { OpenNodeTag, CloseNodeTag, ReferenceTag } from './symbols.js';

const lookbehind = (context, s) => {
  let token = s.resultPath;
  while (token && [OpenNodeTag, CloseNodeTag, ReferenceTag].includes(token.type)) {
    const prevToken = context.getPreviousTagPath(token);
    if (!prevToken) break;
    token = prevToken;
  }
  return token;
};

// eslint-disable-next-line no-undef
const matchedResults = new WeakSet();

export const triviaEnhancer = ({ triviaIsAllowed, eatMatchTrivia }, grammar) => {
  return mapProductions((production) => {
    return function* (props) {
      const co = new Coroutine(production(props));
      const { s, ctx } = props;

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
              if (matcher && matcher.refMatcher?.name !== '#') {
                const previous = lookbehind(ctx, s);
                if (triviaIsAllowed(s) && (!previous || !matchedResults.has(previous))) {
                  matchedResults.add(previous);
                  yield* eatMatchTrivia();
                  matchedResults.add(s.resultPath);
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

        if (!s.node?.flags.token) {
          const previous = lookbehind(ctx, s);
          if (triviaIsAllowed(s) && !matchedResults.has(previous)) {
            matchedResults.add(previous);
            yield* eatMatchTrivia();
            matchedResults.add(s.resultPath);
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
