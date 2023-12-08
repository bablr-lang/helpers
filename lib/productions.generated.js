import { interpolateString as _interpolateString } from "@bablr/boot-helpers/template";
import { interpolateArray as _interpolateArray } from "@bablr/boot-helpers/template";
import * as _t from "@bablr/boot-helpers/types";
export function* List({
  props: {
    element,
    separator,
    allowHoles = false,
    allowTrailingSeparator = true
  }
}) {
  let sep, it;
  for (;;) {
    it = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
        open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
        values: [..._interpolateArray(element)],
        close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
      }, {})
    }, {});
    if (it || allowTrailingSeparator) {
      sep = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
        verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
        arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
          open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
          values: [..._interpolateArray(separator)],
          close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
        }, {})
      }, {});
    }
    if (!(sep || allowHoles)) break;
  }
}
export function* Any({
  props: {
    matchers
  }
}) {
  for (const matcher of matchers) {
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
export function* All({
  props: {
    matchers
  }
}) {
  for (const matcher of matchers) {
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
export function* Optional({
  props: {
    matchers
  }
}) {
  if (matchers.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
    verb: _t.node("Instruction", "Identifier", [_t.lit`eatMatch`], {}, {}),
    arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, _t.ref`values[]`, _t.ref`close`], {
      open: _t.node("Instruction", "Punctuator", [_t.lit`(`], {}, {}),
      values: [..._interpolateArray(matchers[0])],
      close: _t.node("Instruction", "Punctuator", [_t.lit`)`], {}, {})
    }, {})
  }, {});
}
