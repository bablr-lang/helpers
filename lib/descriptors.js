const { eatChrs: eatChrs_ } = require('./commands.js');

const Literal = (type, value) => {
  return {
    type,
    value,
    mergeable: false,
    *eatChrs() {
      return yield* eatChrs_(this.value);
    },
  };
};

const LineBreak = (value = '\n') => {
  return {
    type: 'LineBreak',
    value,
    mergeable: true,
    *eatChrs() {
      return yield* eatChrs_(/\r?\n/);
    },
  };
};

const Punctuator = (value) => Literal('Punctuator', value);
const LeftPunctuator = (value) => Literal('LeftPunctuator', value);
const RightPunctuator = (value) => Literal('RightPunctuator', value);
const Keyword = (value) => Literal('Keyword', value);

module.exports = {
  Literal,
  LineBreak,
  Punctuator,
  LeftPunctuator,
  RightPunctuator,
  Keyword,
};
