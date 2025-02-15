import { spam as m } from '@bablr/boot';
import { buildEmbeddedMatcher, getCooked } from '@bablr/agast-helpers/tree';
import { eat, eatMatch } from './grammar.js';
import { EmbeddedMatcher } from './symbols.js';
import { getEmbeddedMatcher, getEmbeddedObject } from '@bablr/agast-vm-helpers/deembed';
import { buildPropertyMatcher } from './builders.js';

export function* List({ value: props }) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true,
  } = getEmbeddedObject(props);

  if (
    !['#', '@'].includes(
      getCooked(getEmbeddedMatcher(separator).properties.refMatcher.node.properties.name.node),
    )
  ) {
    yield eat(
      buildEmbeddedMatcher(
        buildPropertyMatcher(
          getEmbeddedMatcher(separator).properties.refMatcher.node,
          m.ArrayNodeMatcher`[]`,
        ),
      ),
    );
  }

  yield eat(
    buildEmbeddedMatcher(
      buildPropertyMatcher(
        getEmbeddedMatcher(element).properties.refMatcher.node,
        m.ArrayNodeMatcher`[]`,
      ),
    ),
  );

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

export function* Any({ value: alternatives }) {
  for (const alternative of alternatives) {
    if (alternative.type === EmbeddedMatcher) {
      if (yield eatMatch(alternative)) break;
    } else {
      throw new Error();
    }
  }
}

export function* All({ value: matchers }) {
  for (const matcher of matchers) {
    yield eat(m`.[]: ${getEmbeddedMatcher(matcher).properties.nodeMatcher.node}`);
  }
}

export function* Punctuator({ intrinsicValue }) {
  if (!intrinsicValue) throw new Error('Intrinsic productions must have value');

  yield eat(intrinsicValue);
}

export const Keyword = Punctuator;
