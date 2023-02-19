import { Grammar as BaseGrammar } from '@cst-tokens/grammar';
import { objectEntries } from '@cst-tokens/helpers/object';
import debug from 'debug';

import * as sym from './symbols.js';

const traces = debug.enabled('cst-tokens') ? true : undefined;

const isString = (value) => typeof value === 'string';
const isRegex = (value) => value instanceof RegExp;

function* concat(...iterables) {
  for (const iterable of iterables) yield* iterable;
}

export const Any = Symbol('Any');
export const All = Symbol('All');

const getEdible = (edibles) => {
  if (!edibles.length) {
    throw new Error('No edibles to eat');
  }

  return edibles.length > 1
    ? {
        type: sym.production,
        value: { type: All, property: undefined, props: { edibles } },
      }
    : edibles[0];
};

export class Grammar extends BaseGrammar {
  static get ['Any']() {
    return Any;
  }

  static get ['All']() {
    return All;
  }

  static match(...edibles) {
    const edible = getEdible(edibles);

    return { type: sym.match, value: edible, error: traces && new Error() };
  }

  static matchChrs(...edibles) {
    match(
      edibles.map((edible) =>
        edibles.length === 1 && (isRegex(edible) || isString(edible))
          ? { type: sym.terminal, value: edible }
          : edible,
      ),
    );
  }

  static eatMatch(...edibles) {
    const edible = getEdible(edibles);

    return { type: sym.eatMatch, value: edible, error: traces && new Error() };
  }

  static eatMatchChrs(...edibles) {
    eatMatch(
      edibles.map((edible) =>
        edibles.length === 1 && (isRegex(edible) || isString(edible))
          ? { type: sym.terminal, value: edible }
          : edible,
      ),
    );
  }

  static eat(...edibles) {
    const edible = getEdible(edibles);

    return { type: sym.eat, value: edible, error: traces && new Error() };
  }

  static eatChrs(...edibles) {
    eat(
      edibles.map((edible) =>
        edibles.length === 1 && (isRegex(edible) || isString(edible))
          ? { type: sym.terminal, value: edible }
          : edible,
      ),
    );
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

  constructor(grammar) {
    const { productions } = grammar;
    super({
      ...grammar,
      productions: concat(
        productions,
        objectEntries({
          *[Any]({ edibles }) {
            for (const edible of edibles) {
              if (yield eatMatch(edible)) break;
            }
          },

          *[All]({ edibles }) {
            for (const edible of edibles) {
              yield eat(edible);
            }
          },

          // *[Plus]() {

          // }
        }),
      ),
    });
  }
}

export const { match, eatMatch, eat, startNode, endNode, startToken, endToken } = Grammar;
