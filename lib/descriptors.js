const { eatChrs: eatChrs_ } = require('./commands.js');

const { isArray } = Array;
const stripArray = (value) => (isArray(value) ? value[0] : value);

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

const ref = (value) => Reference(stripArray(value));

module.exports = { LineBreak, ref };
