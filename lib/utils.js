const { isArray } = Array;
const arrayFirst = (arr) => arr[0];
const arrayLast = (arr) => arr[arr.length - 1];

const concatTokens = (...args) => {
  let tokens = [];
  for (const arg of args) {
    if (arg) {
      tokens.push(...arg);
    }
  }
  return tokens.length ? tokens : null;
};

module.exports = { isArray, arrayFirst, arrayLast, concatTokens };
