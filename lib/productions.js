import { i } from '@bablr/boot/shorthand.macro';

export function* List(props, s, ctx) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = ctx.unbox(props);

  let sep, it;
  for (;;) {
    it = yield i`eatMatch(${element} 'elements[]')`;
    if (it || allowTrailingSeparator) {
      sep = yield i`eatMatch(${separator} 'separators[]')`;
    }
    if (!(sep || allowHoles)) break;
  }
}

export function* Any(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    if (yield i`eatMatch(${matcher})`) break;
  }
}

export function* All(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    yield i`eat(${matcher})`;
  }
}

export function* Match(cases, s, ctx) {
  for (const case_ of ctx.unbox(cases)) {
    const { 0: matcher, 1: guard } = ctx.unbox(case_);
    if (yield i`match(${guard})`) {
      yield i`eat(${matcher})`;
      break;
    }
  }
}

export function* Punctuator(obj, s, ctx) {
  const { value, attrs } = ctx.unbox(obj);
  yield i`eat(${value})`;

  return { attrs };
}

export function* Optional(matchers, s, ctx) {
  const matchers_ = ctx.unbox(matchers);
  if (matchers_.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield i`eatMatch(${matchers_[0]})`;
}
