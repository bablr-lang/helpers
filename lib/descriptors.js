import { eatChrs as eatChrs_ } from './commands.js';

export const Literal = (type, value) => {
  return {
    type,
    value,
    mergeable: false,
    *eatChrs() {
      return yield* eatChrs_(this.value);
    },
  };
};

export const LineBreak = (value = '\n') => {
  return {
    type: 'LineBreak',
    value,
    mergeable: true,
    *eatChrs() {
      return yield* eatChrs_(/\r?\n/);
    },
  };
};

export const Punctuator = (value) => Literal('Punctuator', value);
export const LeftPunctuator = (value) => Literal('LeftPunctuator', value);
export const RightPunctuator = (value) => Literal('RightPunctuator', value);
export const Keyword = (value) => Literal('Keyword', value);
