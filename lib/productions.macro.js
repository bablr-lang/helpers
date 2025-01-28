import { spam as m } from '@bablr/boot';
import { printType } from '@bablr/agast-helpers/print';
import { buildPropertyMatcher } from '@bablr/helpers/builders';
import { getCooked } from '@bablr/agast-helpers/tree';
import { eat, eatMatch } from './grammar.js';

export function* List({ value: props, ctx }) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = ctx.unbox(props);

  if (!['#', '@'].includes(getCooked(separator.properties.refMatcher.node.properties.name.node))) {
    yield eat(buildPropertyMatcher(separator.properties.refMatcher.node, m.ArrayNodeMatcher`[]`));
  }

  yield eat(buildPropertyMatcher(element.properties.refMatcher.node, m.ArrayNodeMatcher`[]`));

  let sep,
    it,
    anySep = false;
  for (;;) {
    it = yield eatMatch(element);
    if (it || allowTrailingSeparator) {
      sep = yield eatMatch(separator);
      anySep ||= sep;
    }
    if (!(sep || allowHoles)) break;
  }
}

export function* Any({ value: alternatives, ctx }) {
  for (const alternative of ctx.unbox(alternatives)) {
    if (printType(alternative.type) === 'PropertyMatcher') {
      const matcher = alternative;

      if (yield eatMatch(matcher)) break;
    } else {
      throw new Error();
    }
  }
}

export function* All({ value: matchers, ctx }) {
  for (const matcher of ctx.unbox(matchers)) {
    yield eat(m`.[]: ${matcher.properties.nodeMatcher.node}`);
  }
}

export function* Punctuator({ intrinsicValue }) {
  if (!intrinsicValue) throw new Error('Intrinsic productions must have value');

  yield eat(intrinsicValue);
}

export const Keyword = Punctuator;
