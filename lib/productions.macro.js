import { i } from '@bablr/boot';
import { OpenNodeTag, ReferenceTag } from './symbols.js';
import { printType } from '@bablr/agast-helpers/print';

export function* List({ value: props, ctx }) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = ctx.unbox(props);

  yield i`eat(separators[]: [])`;

  let sep,
    it,
    anySep = false;
  for (;;) {
    it = yield i`eatMatch(.[]: ${element})`;
    if (it || allowTrailingSeparator) {
      sep = yield i`eatMatch(separators[]: ${separator})`;
      anySep ||= sep;
    }
    if (!(sep || allowHoles)) break;
  }
}

export function* Any({ value: alternatives, ctx }) {
  for (const alternative of ctx.unbox(alternatives)) {
    if (printType(alternative.type) === 'PropertyMatcher') {
      const matcher = alternative;

      if (yield i`eatMatch(${matcher})`) break;
    } else {
      throw new Error();
    }
  }
}

export function* All({ value: matchers, ctx }) {
  for (const matcher of ctx.unbox(matchers)) {
    yield i`eat(.[]: ${matcher})`;
  }
}

export function* Punctuator({ intrinsicValue }) {
  if (!intrinsicValue) throw new Error('Intrinsic productions must have value');

  yield i`eat(.: ${intrinsicValue})`;
}

export const Keyword = Punctuator;

export function* Optional({ value: matchers, ctx }) {
  const matchers_ = ctx.unbox(matchers);
  if (matchers_.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield i`eatMatch(.: ${matchers_[0]})`;
}
