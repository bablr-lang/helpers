import { Grammar as BaseGrammar } from '@bablr/grammar';
import { productionFor, productions } from './productions.js';
import { stringPattern, tokenTag } from './ast.js';
import { eat, eatMatch } from './shorthand.js';
import { map, concat } from './iterable.js';
import * as sym from './symbols.js';

export function* NamedLiteral({ value }) {
  yield eat(stringPattern(value));
}

export function* List({
  attrs: { separator, matchable, allowHoles = false, allowTrailingSeparator = true },
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

const utilityProductions = productions({
  *Any({ attrs }) {
    const matchables = attrs.get('matchables');
    for (const matchable of matchables) {
      if (yield eatMatch(matchable)) break;
    }
  },

  *All({ attrs }) {
    const matchables = attrs.get('matchables');
    for (const matchable of matchables) {
      yield eat(matchable);
    }
  },
});

export class Grammar extends BaseGrammar {
  constructor(grammar, enhancers) {
    const aliasProductions = map(([aliasType, types]) => {
      return productionFor(aliasType, function* match(props) {
        const { value, attrs } = props;
        const matchables = types.map((type) => tokenTag(type, value, attrs));

        yield eat(tokenTag(sym.Any, null, { matchables }));
      });
    }, grammar.aliases);

    super(
      {
        ...grammar,
        productions: concat(aliasProductions, utilityProductions, grammar.productions),
      },
      enhancers,
    );
  }
}
