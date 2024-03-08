import { interpolateString as _interpolateString } from "@bablr/agast-helpers/template";
import { interpolateArrayChildren as _interpolateArrayChildren } from "@bablr/agast-helpers/template";
import { interpolateArray as _interpolateArray } from "@bablr/agast-helpers/template";
import * as _t from "@bablr/agast-helpers/shorthand";
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
      verb: _t.node("Instruction", "Identifier", [_t.lit("eatMatch")], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(element, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.embedded(_t.t_node('Space', 'Space', [{
        type: "Literal",
        value: " "
      }], {}, [])), _t.ref`values[]`, _t.ref`close`], {
        open: _t.s_node("Instruction", "Punctuator", "("),
        values: [..._interpolateArray(element), _t.node("String", "String", [_t.ref`open`, _t.ref`content`, _t.ref`close`], {
          open: _t.s_node("String", "Punctuator", "'"),
          content: _t.node("String", "Content", [_t.lit("elements[]")], {}, {}),
          close: _t.s_node("String", "Punctuator", "'")
        }, {})],
        close: _t.s_node("Instruction", "Punctuator", ")")
      }, {})
    }, {});
    if (it || allowTrailingSeparator) {
      sep = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
        verb: _t.node("Instruction", "Identifier", [_t.lit("eatMatch")], {}, {}),
        arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(separator, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.embedded(_t.t_node('Space', 'Space', [{
          type: "Literal",
          value: " "
        }], {}, [])), _t.ref`values[]`, _t.ref`close`], {
          open: _t.s_node("Instruction", "Punctuator", "("),
          values: [..._interpolateArray(separator), _t.node("String", "String", [_t.ref`open`, _t.ref`content`, _t.ref`close`], {
            open: _t.s_node("String", "Punctuator", "'"),
            content: _t.node("String", "Content", [_t.lit("separators[]")], {}, {}),
            close: _t.s_node("String", "Punctuator", "'")
          }, {})],
          close: _t.s_node("Instruction", "Punctuator", ")")
        }, {})
      }, {});
    }
    if (!(sep || allowHoles)) break;
  }
}
export function* Any(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    if (yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit("eatMatch")], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(matcher, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
        open: _t.s_node("Instruction", "Punctuator", "("),
        values: [..._interpolateArray(matcher)],
        close: _t.s_node("Instruction", "Punctuator", ")")
      }, {})
    }, {})) break;
  }
}
export function* All(matchers, s, ctx) {
  for (const matcher of ctx.unbox(matchers)) {
    yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit("eat")], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(matcher, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
        open: _t.s_node("Instruction", "Punctuator", "("),
        values: [..._interpolateArray(matcher)],
        close: _t.s_node("Instruction", "Punctuator", ")")
      }, {})
    }, {});
  }
}
export function* Match(cases, s, ctx) {
  for (const case_ of ctx.unbox(cases)) {
    const {
      0: matcher,
      1: guard,
      2: props = _t.node("Instruction", "Null", [_t.ref`value`], {
        value: _t.s_node("Instruction", "Keyword", "null")
      }, {})
    } = ctx.unbox(case_);
    if (yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
      verb: _t.node("Instruction", "Identifier", [_t.lit("match")], {}, {}),
      arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(guard, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
        open: _t.s_node("Instruction", "Punctuator", "("),
        values: [..._interpolateArray(guard)],
        close: _t.s_node("Instruction", "Punctuator", ")")
      }, {})
    }, {})) {
      yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
        verb: _t.node("Instruction", "Identifier", [_t.lit("eat")], {}, {}),
        arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(matcher, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.embedded(_t.t_node('Space', 'Space', [{
          type: "Literal",
          value: " "
        }], {}, [])), _t.ref`values[]`, _t.embedded(_t.t_node('Space', 'Space', [{
          type: "Literal",
          value: " "
        }], {}, [])), ..._interpolateArrayChildren(props, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
          open: _t.s_node("Instruction", "Punctuator", "("),
          values: [..._interpolateArray(matcher), _t.node("Instruction", "Null", [_t.ref`value`], {
            value: _t.s_node("Instruction", "Keyword", "null")
          }, {}), ..._interpolateArray(props)],
          close: _t.s_node("Instruction", "Punctuator", ")")
        }, {})
      }, {});
      break;
    }
  }
}
export function* Punctuator(obj, s, ctx) {
  const {
    value
  } = ctx.unbox(obj);
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
    verb: _t.node("Instruction", "Identifier", [_t.lit("eat")], {}, {}),
    arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(value, _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
      open: _t.s_node("Instruction", "Punctuator", "("),
      values: [..._interpolateArray(value)],
      close: _t.s_node("Instruction", "Punctuator", ")")
    }, {})
  }, {});
}
export const Keyword = Punctuator;
export function* Optional(matchers, s, ctx) {
  const matchers_ = ctx.unbox(matchers);
  if (matchers_.length > 1) {
    throw new Error('Optional only allows one matcher');
  }
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`arguments`], {
    verb: _t.node("Instruction", "Identifier", [_t.lit("eatMatch")], {}, {}),
    arguments: _t.node("Instruction", "Tuple", [_t.ref`open`, ..._interpolateArrayChildren(matchers_[0], _t.ref`values[]`, _t.embedded(_t.t_node('Comment', null, [_t.embedded(_t.t_node('Space', 'Space', [_t.lit(' ')]))]))), _t.ref`close`], {
      open: _t.s_node("Instruction", "Punctuator", "("),
      values: [..._interpolateArray(matchers_[0])],
      close: _t.s_node("Instruction", "Punctuator", ")")
    }, {})
  }, {});
}
