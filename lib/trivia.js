import { Coroutine } from '@bablr/coroutine';
import { reifyExpression } from '@bablr/agast-vm-helpers';
import { mapProductions } from './grammar.js';
import { OpenNodeTag, CloseNodeTag, ReferenceTag, EmbeddedMatcher } from './symbols.js';
import { getEmbeddedMatcher } from '@bablr/agast-vm-helpers/deembed';
import { getCooked, isFragmentNode } from '@bablr/agast-helpers/tree';

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
          const instr = co.value;
          const { verb, arguments: args = [] } = instr;
          let returnValue = undefined;

          switch (verb) {
            case 'eat':
            case 'eatMatch':
            case 'match':
            case 'guard': {
              const { 0: matcher, 1: props, 2: options } = args;
              if (
                matcher &&
                matcher.type === EmbeddedMatcher &&
                getCooked(matcher.value.properties.refMatcher?.node.properties.name.node) !== '#'
              ) {
                const previous = lookbehind(ctx, s);
                if (triviaIsAllowed(s) && (!previous || !matchedResults.has(previous))) {
                  matchedResults.add(previous);
                  yield* eatMatchTrivia();
                  matchedResults.add(s.resultPath);
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

        if (!s.node?.flags.token && s.node.isFragmentNode) {
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
