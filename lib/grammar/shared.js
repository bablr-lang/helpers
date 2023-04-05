import { Grammar as BaseGrammar } from '@cst-tokens/grammar';
import { productions as productionsFor } from '../productions.js';
import { concat } from '../iterable.js';
import * as sym from '../symbols.js';

export const traces = globalThis.process?.env.DEBUG || null;

export const Any = Symbol('Any');
export const All = Symbol('All');

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

  constructor(grammar, enhancers) {
    let eat, eatMatch;

    const productions = concat(
      productionsFor({
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
    );

    super({ ...grammar, productions }, enhancers);

    ({ eat, eatMatch } = this.constructor);
  }
}
