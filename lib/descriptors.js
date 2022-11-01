const { eatChrs: eatChrs_ } = require('./commands.js');

const Literal = (type, value) => {
  return {
    type,
    value,
    mergeable: false,
    build() {
      return { type, value };
    },
    *eatChrs() {
      return yield* eatChrs_(this.value);
    },
  };
};

const LineBreak = (value = '\n') => {
  const defaultValue = value;
  return {
    type: 'LineBreak',
    value,
    mergeable: true,
    build(value) {
      return { type: 'LineBreak', value: value || defaultValue };
    },
    *eatChrs() {
      return yield* eatChrs_(/\r?\n/);
    },
  };
};

const Punctuator = (value) => Literal('Punctuator', value);
const LeftPunctuator = (value) => Literal('LeftPunctuator', value);
const RightPunctuator = (value) => Literal('RightPunctuator', value);
const Keyword = (value) => Literal('Keyword', value);
const StringStart = (value) => Literal('StringStart', value);
const StringEnd = (value) => Literal('StringEnd', value);

module.exports = {
  Literal,
  LineBreak,
  Punctuator,
  LeftPunctuator,
  RightPunctuator,
  Keyword,
  StringStart,
  StringEnd,
};
