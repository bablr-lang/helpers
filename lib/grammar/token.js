import { Grammar, All, map, concat, traces } from './shared.js';
import { tok, chrs } from '../shorthand.js';
import * as sym from '../symbols.js';

const isString = (value) => typeof value === 'string';
const isRegex = (value) => value instanceof RegExp;

const matchableFromMatchables = (matchables) => {
  const matchables_ = matchables.map((matchable) =>
    isRegex(matchable) || isString(matchable) ? chrs(matchable) : matchable,
  );
  return matchables_.length > 1 ? tok(All, matchables_) : matchables_[0];
};

export class TokenGrammar extends Grammar {
  constructor(grammar) {
    const { productions, aliases } = grammar;

    const aliasProductions = map(([aliasType, types]) => {
      return [
        aliasType,
        function* TokenAlias(props) {
          const { value, alterLexicalState } = props;

          for (const type of types) {
            if (yield eatMatch(tok(type, value, alterLexicalState))) break;
          }
        },
      ];
    }, aliases);

    super({
      ...grammar,
      productions: concat(aliasProductions, productions),
    });
  }

  get productionType() {
    return sym.token;
  }

  static eat(...matchables) {
    return {
      type: sym.eat,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static match(...matchables) {
    return {
      type: sym.match,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static eatMatch(...matchables) {
    return {
      type: sym.eatMatch,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static startToken(type) {
    return {
      type: sym.startToken,
      value: type,
      error: traces && new Error(),
    };
  }

  static endToken() {
    return {
      type: sym.endToken,
      value: undefined,
      error: traces && new Error(),
    };
  }
}

export const { eat, match, eatMatch, fail, startToken, endToken } = TokenGrammar;
