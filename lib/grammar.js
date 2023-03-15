import { Grammar as BaseGrammar } from '@cst-tokens/grammar';
import { objectEntries } from '@cst-tokens/helpers/object';
import { node, tok } from './shorthand.js';

import * as sym from './symbols.js';

const traces = globalThis.process?.env.DEBUG || null;

const isString = (value) => typeof value === 'string';
const isRegex = (value) => value instanceof RegExp;

function* map(fn, iterable) {
  for (const value of iterable) yield fn(value);
}

function* concat(...iterables) {
  for (const iterable of iterables) yield* iterable;
}

export const Any = Symbol('Any');
export const All = Symbol('All');

const getMatchable = (matchables, type) => {
  if (!matchables.length) {
    throw new Error('No matchables to eat');
  }

  return matchables.length > 1
    ? {
        type,
        value: { type: All, property: undefined, props: { matchables } },
      }
    : matchables[0];
};

export class Grammar extends BaseGrammar {
  static get ['Any']() {
    return Any;
  }

  static get ['All']() {
    return All;
  }

  static eat(...matchables) {
    const matchable = getMatchable(matchables, sym.node);

    return { type: sym.eat, value: matchable, error: traces && new Error() };
  }

  static eatChrs(...matchables) {
    const matchable = getMatchable(
      matchables.map((matchable) =>
        matchables.length === 1 && (isRegex(matchable) || isString(matchable))
          ? { type: sym.character, value: matchable }
          : matchable,
      ),
      sym.token,
    );

    return { type: sym.eat, value: matchable, error: traces && new Error() };
  }

  static match(...matchables) {
    const matchable = getMatchable(matchables, sym.node);

    return { type: sym.match, value: matchable, error: traces && new Error() };
  }

  static matchChrs(...matchables) {
    const matchable = getMatchable(
      matchables.map((matchable) =>
        matchables.length === 1 && (isRegex(matchable) || isString(matchable))
          ? { type: sym.character, value: matchable }
          : matchable,
      ),
      sym.token,
    );

    return { type: sym.match, value: matchable, error: traces && new Error() };
  }

  static eatMatch(...matchables) {
    const matchable = getMatchable(matchables, sym.node);

    return { type: sym.eatMatch, value: matchable, error: traces && new Error() };
  }

  static eatMatchChrs(...matchables) {
    const matchable = getMatchable(
      matchables.map((matchable) =>
        matchables.length === 1 && (isRegex(matchable) || isString(matchable))
          ? { type: sym.character, value: matchable }
          : matchable,
      ),
      sym.token,
    );

    return { type: sym.eatMatch, value: matchable, error: traces && new Error() };
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

  static fail() {
    return {
      type: sym.fail,
      value: undefined,
      error: traces && new Error(),
    };
  }

  constructor(grammar) {
    const { productions, aliases } = grammar;

    const aliasProductions = map(([aliasType, types]) => {
      return [
        aliasType,
        function* Alias(props) {
          const { productionType } = props;

          for (const type of types) {
            if (yield eatMatch(productionType === sym.node ? node(type) : tok(type))) break;
          }
        },
      ];
    }, aliases);

    super({
      ...grammar,
      productions: concat(
        aliasProductions,
        productions,
        objectEntries({
          *[Any]({ matchables }) {
            for (const matchable of matchables) {
              if (yield eatMatch(matchable)) break;
            }
          },

          *[All]({ matchables }) {
            for (const matchable of matchables) {
              yield eat(matchable);
            }
          },
        }),
      ),
    });
  }
}

export const {
  eat,
  eatChrs,
  match,
  matchChrs,
  eatMatch,
  eatMatchChrs,
  fail,
  startToken,
  endToken,
  startNode,
  endNode,
} = Grammar;
