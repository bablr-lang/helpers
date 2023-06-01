import { Grammar, traces } from './shared.js';
import { productionFor } from '../productions.js';
import { tok, chrs } from '../shorthand.js';
import { map, concat } from '../iterable.js';
import * as sym from '../symbols.js';

export function* NamedLiteral({ value }) {
  yield eat(chrs(value));
}

const isString = (value) => typeof value === 'string';
const isRegex = (value) => value instanceof RegExp;

const matchableFromMatchables = (matchables) => {
  const matchables_ = matchables.map((matchable) =>
    isRegex(matchable) || isString(matchable) ? chrs(matchable) : matchable,
  );
  return matchables_.length > 1 ? tok(sym.All, matchables_) : matchables_[0];
};

export class TokenGrammar extends Grammar {
  constructor(grammar, enhancers) {
    const aliasProductions = map(([aliasType, types]) => {
      return productionFor(aliasType, function* match(props) {
        const { value, alterLexicalContext } = props;
        const matchables = types.map((type) => tok(type, value, alterLexicalContext));

        yield eat(tok(sym.All, matchables));
      });
    }, grammar.aliases);

    const productions = concat(aliasProductions, grammar.productions);

    super({ ...grammar, productions }, enhancers);
  }

  get productionType() {
    return sym.token;
  }

  static Any(...matchables) {
    return tok(sym.Any, { matchables });
  }

  static All(...matchables) {
    return tok(sym.All, { matchables });
  }

  static guard(...matchables) {
    return {
      type: sym.match,
      value: {
        successEffect: sym.none,
        failureEffect: sym.fail,
        matchable: matchableFromMatchables(matchables),
      },
      error: traces && new Error(),
    };
  }

  static match(...matchables) {
    return {
      type: sym.match,
      value: {
        successEffect: sym.none,
        failureEffect: sym.none,
        matchable: matchableFromMatchables(matchables),
      },
      error: traces && new Error(),
    };
  }

  static eat(...matchables) {
    return {
      type: sym.match,
      value: {
        successEffect: sym.eat,
        failureEffect: sym.fail,
        matchable: matchableFromMatchables(matchables),
      },
      error: traces && new Error(),
    };
  }

  static eatMatch(...matchables) {
    return {
      type: sym.match,
      value: {
        successEffect: sym.eat,
        failureEffect: sym.none,
        matchable: matchableFromMatchables(matchables),
      },
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

export const { guard, match, eat, eatMatch, fail, startToken, endToken, Any, All } = TokenGrammar;
