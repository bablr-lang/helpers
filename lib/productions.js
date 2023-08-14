import { eat, eatMatch } from './shorthand.js';

export function* NamedLiteral({ value }) {
  yield eat(value);
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

export function* Any({ attrs }) {
  const matchables = attrs.get('matchables');
  for (const matchable of matchables) {
    if (yield eatMatch(matchable)) break;
  }
}

export function* All({ attrs }) {
  const matchables = attrs.get('matchables');
  for (const matchable of matchables) {
    yield eat(matchable);
  }
}
