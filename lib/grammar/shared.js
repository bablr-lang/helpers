import { Grammar as BaseGrammar } from '@cst-tokens/grammar';
import { objectEntries } from '../object.js';
import * as sym from '../symbols.js';

export const traces = globalThis.process?.env.DEBUG || null;

export const Any = Symbol('Any');
export const All = Symbol('All');

export function* map(fn, iterable) {
  for (const value of iterable) yield fn(value);
}

export function* concat(...iterables) {
  for (const iterable of iterables) yield* iterable;
}

export class Grammar extends BaseGrammar {
  static get ['Any']() {
    return Any;
  }

  static get ['All']() {
    return All;
  }

  static fail() {
    return {
      type: sym.fail,
      value: undefined,
      error: traces && new Error(),
    };
  }

  constructor(grammar) {
    let eat, eatMatch;

    super({
      ...grammar,
      productions: concat(
        objectEntries({
          *[Any]({ value: matchables }) {
            for (const matchable of matchables) {
              if (yield eatMatch(matchable)) break;
            }
          },

          *[All]({ value: matchables }) {
            for (const matchable of matchables) {
              yield eat(matchable);
            }
          },
        }),
        grammar.productions,
      ),
    });

    ({ eat, eatMatch } = this.constructor);
  }
}
