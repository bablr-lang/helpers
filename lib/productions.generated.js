import { interpolateString as _interpolateString } from "@bablr/boot-helpers/template";
import { interpolateArray as _interpolateArray } from "@bablr/boot-helpers/template";
import * as _t from "@bablr/boot-helpers/types";
export function* List(props, s, ctx) {
  const {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true
  } = ctx.unbox(props);
  let sep, it;
  for (;;) {
    it = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.trivia` `, _t.ref`values[]`, _t.ref`close`], {
        open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
        values: [..._interpolateArray(element), _t.node("String", "String", [_t.ref`open`, _t.ref`content`, _t.ref`close`], {
          open: _t.node("String", "Punctuator", [_t.lit`'`], {}, {}),
          content: _t.node("String", "Content", [_t.lit`elements[]`], {}, {}),
          close: _t.node("String", "Punctuator", [_t.lit`'`], {}, {})
        }, {})],
        close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
      }, {})
    }, {});
    if (it || allowTrailingSeparator) {
      sep = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
        verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
        arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.trivia` `, _t.ref`values[]`, _t.ref`close`], {
          open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
          values: [..._interpolateArray(separator), _t.node("String", "String", [_t.ref`open`, _t.ref`content`, _t.ref`close`], {
            open: _t.node("String", "Punctuator", [_t.lit`'`], {}, {}),
            content: _t.node("String", "Content", [_t.lit`separators[]`], {}, {}),
            close: _t.node("String", "Punctuator", [_t.lit`'`], {}, {})
          }, {})],
          close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
        }, {})
      }, {});
    }
    if (!(sep || allowHoles)) break;
  }
}
export function* Any(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    if (yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
        open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
        values: [..._interpolateArray(matcher)],
        close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
      }, {})
    }, {})) break;
  }
}
export function* All(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit`eat`], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
        open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
        values: [..._interpolateArray(matcher)],
        close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
      }, {})
    }, {});
  }
}
export function* Match(cases, s, ctx) {
  for (const case_ of ctx.unbox(cases)) {
    const {
      0: matcher,
      1: guard
    } = ctx.unbox(case_);
    if (yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit`match`], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
        open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
        values: [..._interpolateArray(guard)],
        close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
      }, {})
    }, {})) {
      yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
        verb: _t.node("Instruction", "Identifier", [_t.lit`eat`], {}, {}),
        arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
          open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
          values: [..._interpolateArray(matcher)],
          close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
        }, {})
      }, {});
      break;
    }
  }
}
export function* Punctuator(obj, s, ctx) {
  const {
    value,
    attrs
  } = ctx.unbox(obj);
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
    verb: _t.node("Instruction", "Identifier", [_t.lit`eat`], {}, {}),
    arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
      open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
      values: [..._interpolateArray(value)],
      close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
    }, {})
  }, {});
  return {
    attrs
  };
}
export const Keyword = Punctuator;
export function* Optional(matchers, s, ctx) {
  const matchers_ = ctx.unbox(matchers);
  if (matchers_.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
    verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
    arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
      open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
      values: [..._interpolateArray(matchers_[0])],
      close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
    }, {})
  }, {});
}
