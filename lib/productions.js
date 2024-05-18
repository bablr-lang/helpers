import { i } from '@bablr/boot/shorthand.macro';

export function* List({ value: props, ctx }) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = ctx.unbox(props);

  let sep, it;
  for (;;) {
    it = yield i`eatMatch(${element})`;
    if (it || allowTrailingSeparator) {
      sep = yield i`eatMatch(${separator} 'separators[]')`;
    }
    if (!(sep || allowHoles)) break;
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

export function* Match({ value: cases, ctx }) {
  for (const case_ of ctx.unbox(cases)) {
    const { 0: matcher, 1: guard, 2: props = i.Expression`null` } = ctx.unbox(case_);
    if (yield i`match(${guard})`) {
      yield i`eat(${matcher} null ${props})`;
      break;
    }
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
