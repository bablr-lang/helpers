import { eat, eatMatch } from './shorthand.js';

export function* List(
  expression,
  { separator, allowHoles = false, allowTrailingSeparator = true },
) {
  let sep, item;
  for (;;) {
    item = yield eatMatch(expression);
    if (item || allowTrailingSeparator) {
      sep = yield eatMatch(separator);
    }
    if (!(sep || allowHoles)) break;
  }
}

export function* Any(expressions) {
  for (const expression of expressions) {
    if (yield eatMatch(expression)) break;
  }
}

export function* All(expressions) {
  for (const expression of expressions) {
    yield eat(expression);
  }
}

export function* Optional(expression) {
  yield eatMatch(expression);
}
