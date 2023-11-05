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
    it = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`open`, _t.gap`argument`, _t.ref`close`], {
      verb: _t.node("Instruction", "Identifier", [_t.str`eatMatch`], {}),
      open: _t.node("Instruction", "Punctuator", [_t.str`(`], {}),
      argument: element,
      close: _t.node("Instruction", "Punctuator", [_t.str`)`], {})
    });
    if (it || allowTrailingSeparator) {
      sep = yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`open`, _t.gap`argument`, _t.ref`close`], {
        verb: _t.node("Instruction", "Identifier", [_t.str`eatMatch`], {}),
        open: _t.node("Instruction", "Punctuator", [_t.str`(`], {}),
        argument: separator,
        close: _t.node("Instruction", "Punctuator", [_t.str`)`], {})
      });
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
    if (yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`open`, _t.gap`argument`, _t.ref`close`], {
      verb: _t.node("Instruction", "Identifier", [_t.str`eatMatch`], {}),
      open: _t.node("Instruction", "Punctuator", [_t.str`(`], {}),
      argument: matcher,
      close: _t.node("Instruction", "Punctuator", [_t.str`)`], {})
    })) break;
  }
}
export function* All({
  props: {
    matchers
  }
}) {
  for (const matcher of matchers) {
    yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`open`, _t.gap`argument`, _t.ref`close`], {
      verb: _t.node("Instruction", "Identifier", [_t.str`eat`], {}),
      open: _t.node("Instruction", "Punctuator", [_t.str`(`], {}),
      argument: matcher,
      close: _t.node("Instruction", "Punctuator", [_t.str`)`], {})
    });
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
  yield _t.node("Instruction", "Call", [_t.ref`verb`, _t.ref`open`, _t.gap`argument`, _t.ref`close`], {
    verb: _t.node("Instruction", "Identifier", [_t.str`eatMatch`], {}),
    open: _t.node("Instruction", "Punctuator", [_t.str`(`], {}),
    argument: matchers[0],
    close: _t.node("Instruction", "Punctuator", [_t.str`)`], {})
  });
}
