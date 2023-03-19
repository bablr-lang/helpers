import { node } from '../shorthand.js';
import { Grammar, All, map, concat, traces } from './shared.js';
import * as sym from '../symbols.js';

const matchableFromMatchables = (matchables) => {
  return matchables.length > 1 ? node(All, null, matchables) : matchables[0];
};

export class NodeGrammar extends Grammar {
  constructor(grammar) {
    const { productions, aliases } = grammar;

    const aliasProductions = map(([aliasType, types]) => {
      return [
        aliasType,
        function* NodeAlias(props) {
          const { property, value } = props;

          for (const type of types) {
            if (yield eatMatch(node(type, property, value))) break;
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
    return sym.node;
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

  static startNode(type) {
    return {
      type: sym.startNode,
      value: type,
      error: traces && new Error(),
    };
  }

  static endNode() {
    return {
      type: sym.endNode,
      value: undefined,
      error: traces && new Error(),
    };
  }
}

export const { eat, match, eatMatch, fail, startNode, endNode } = NodeGrammar;
