import { i } from '@bablr/boot/shorthand.macro';

export function* List({ value: props, ctx }) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = ctx.unbox(props);

  let sep,
    it,
    anySep = false;
  for (;;) {
    it = yield i`eatMatch(${element})`;
    if (it || allowTrailingSeparator) {
      sep = yield i`eatMatch(${separator} 'separators[]')`;
      anySep ||= sep;
    }
    if (!(sep || allowHoles)) break;
  }

  if (!anySep) {
    yield i`eat(null 'separators[]')`;
  }
}

export function* Any({ value: matchers, ctx }) {
  for (const matcher of ctx.unbox(matchers)) {
    if (yield i`eatMatch(${matcher})`) break;
  }
}

export function* All({ value: matchers, ctx }) {
  for (const matcher of ctx.unbox(matchers)) {
    yield i`eat(${matcher})`;
  }
}

export function* Punctuator({ intrinsicValue }) {
  if (!intrinsicValue) throw new Error('Intrinsic productions must have value');

  yield i`eat(${intrinsicValue})`;
}

export const Keyword = Punctuator;

export function* Optional({ value: matchers, ctx }) {
  const matchers_ = ctx.unbox(matchers);
  if (matchers_.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield i`eatMatch(${matchers_[0]})`;
}
