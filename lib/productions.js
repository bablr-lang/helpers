import { i } from '@bablr/boot/shorthand.macro';

export function* List({
  props: { element, separator, allowHoles = false, allowTrailingSeparator = true },
}) {
  let sep, it;
  for (;;) {
    it = yield i`eatMatch(${element})`;
    if (it || allowTrailingSeparator) {
      sep = yield i`eatMatch(${separator})`;
    }
    if (!(sep || allowHoles)) break;
  }
}

export function* Any({ props: { matchers } }) {
  for (const matcher of matchers) {
    if (yield i`eatMatch(${matcher})`) break;
  }
}

export function* All({ props: { matchers } }) {
  for (const matcher of matchers) {
    yield i`eat(${matcher})`;
  }
}

export function* Optional({ props: { matchers } }) {
  if (matchers.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield i`eatMatch(${matchers[0]})`;
}
