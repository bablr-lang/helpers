const { Punctuator, LeftPunctuator, RightPunctuator, Keyword } = require('./descriptors.js');

const { isArray } = Array;

const stripArray = (v) => (isArray(v) ? v[0] : v);
// Allow a function to be called as either fn(val) or fn`val`
const withValueArg = (fn) => {
  return { [fn.name]: (v) => fn(stripArray(v)) }[fn.name];
};

const ref = (name) => stripArray(name);
const PN = withValueArg(Punctuator);
const LPN = withValueArg(LeftPunctuator);
const RPN = withValueArg(RightPunctuator);
const KW = withValueArg(Keyword);

module.exports = { withValueArg, ref, PN, LPN, RPN, KW };
