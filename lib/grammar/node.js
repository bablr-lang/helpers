import { node } from '../shorthand.js';
import { productionFor } from '../productions.js';
import * as sym from '../symbols.js';
import { map, concat } from '../iterable.js';
import { Grammar, traces, All } from './shared.js';

const matchableFromMatchables = (matchables) => {
  return matchables.length > 1 ? node(All, null, matchables) : matchables[0];
};

export class NodeGrammar extends Grammar {
  constructor(grammar, enhancers) {
    const aliasProductions = map(([aliasType, types]) => {
      return productionFor(aliasType, function* match(props) {
        const { property, value } = props;

        for (const type of types) {
          if (yield eatMatch(node(type, property, value))) break;
        }
      });
    }, grammar.aliases);

    const productions = concat(aliasProductions, grammar.productions);

    super({ ...grammar, productions }, enhancers);
  }

  get productionType() {
    return sym.node;
  }

  static eat(...matchables) {
    return {
      type: sym.eat,
      branch: false,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static match(...matchables) {
    return {
      type: sym.match,
      branch: true,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static eatMatch(...matchables) {
    return {
      type: sym.eat,
      branch: true,
      value: matchableFromMatchables(matchables),
      error: traces && new Error(),
    };
  }

  static startNode(type) {
    return {
      type: sym.startNode,
      branch: false,
      value: type,
      error: traces && new Error(),
    };
  }

  static endNode() {
    return {
      type: sym.endNode,
      branch: false,
      value: undefined,
      error: traces && new Error(),
    };
  }
}

export const { eat, match, eatMatch, fail, startNode, endNode } = NodeGrammar;
