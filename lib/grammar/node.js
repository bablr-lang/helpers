import { node } from '../shorthand.js';
import { productionFor } from '../productions.js';
import * as sym from '../symbols.js';
import { map, concat } from '../iterable.js';
import { Grammar, traces } from './shared.js';

export function* List({
  value: { separator, matchable, allowHoles = false, allowTrailingSeparator = true },
}) {
  let sep, item;
  for (;;) {
    item = yield eatMatch(matchable);
    if (item || allowTrailingSeparator) {
      sep = yield eatMatch(separator);
    }
    if (!(sep || allowHoles)) break;
  }
}

const matchableFromMatchables = (matchables) => {
  return matchables.length > 1 ? node(sym.All, null, matchables) : matchables[0];
};

export class NodeGrammar extends Grammar {
  constructor(grammar, enhancers) {
    const aliasProductions = map(([aliasType, types]) => {
      return productionFor(aliasType, function* match(props) {
        const { property, value } = props;
        const matchables = types.map((type) => node(type, property, value));

        yield eat(node(sym.All, null, matchables));
      });
    }, grammar.aliases);

    const productions = concat(aliasProductions, grammar.productions);

    super({ ...grammar, productions }, enhancers);
  }

  get productionType() {
    return sym.node;
  }

  static Any(...matchables) {
    return node(sym.Any, null, { matchables });
  }

  static All(...matchables) {
    return node(sym.All, null, { matchables });
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
}

export const { guard, match, eat, eatMatch, fail, Any, All } = NodeGrammar;
