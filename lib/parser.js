import { isString, isRegex } from './object.js';

const matchSticky = (pattern, { literal, idx }) => {
  if (isString(pattern)) {
    return literal.slice(idx).startsWith(pattern) ? pattern : null;
  } else if (isRegex(pattern)) {
    if (!pattern.sticky) throw new Error('be sticky!');
    const tmp = pattern.lastIndex;

    pattern.lastIndex = idx;

    const result = pattern.exec(literal);

    pattern.lastIndex = tmp;

    return result ? result[0] : null;
  } else {
    throw new Error(`Unknown pattern type`);
  }
};

class TemplateParser {
  constructor(grammar, literals, quasis) {
    this.grammar = grammar;
    this.literals = literals;
    this.quasis = quasis;
    this.literalIdx = 0;
    this.quasiIdx = 0;
    this.idx = 0;
  }

  get literal() {
    return this.literals[this.literalIdx];
  }

  get quasi() {
    return this.quasis[this.quasiIdx];
  }

  get literalDone() {
    return this.idx >= this.literal.length;
  }

  get done() {
    return this.literalDone && this.literalIdx >= this.literals.length;
  }

  get chr() {
    return this.literal[this.idx];
  }

  eval(type) {
    return this.grammar.get(type).value(this);
  }

  eatProduction(type) {
    if (this.literalDone) {
      const { quasi } = this;
      this.quasiIdx++;
      this.literalIdx++;
      this.idx = 0;
      return quasi;
    } else {
      const result = this.grammar.get(type).value(this);

      return this.grammar.is('Node', type) ? { type, value: result } : result;
    }
  }

  eat(pattern) {
    const result = matchSticky(pattern, this);

    if (!result) throw new Error('miniparser: parsing failed');

    this.idx += result.length;

    return result;
  }

  match(pattern) {
    return matchSticky(pattern, this);
  }

  eatMatch(pattern) {
    const result = matchSticky(pattern, this);
    if (result) {
      this.idx += result.length;
    }
    return result;
  }
}

export const templateParse = (grammar, type, literals, ...quasis) => {
  return new TemplateParser(grammar, literals, quasis).eval(type);
};
