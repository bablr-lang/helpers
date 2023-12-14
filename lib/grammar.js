import every from 'iter-tools-es/methods/every';
import isString from 'iter-tools-es/methods/is-string';
import { objectEntries, getPrototypeOf } from './object.js';

const { isArray } = Array;
const isSymbol = (value) => typeof value === 'symbol';
const isType = (value) => isString(value) || isSymbol(value);

export const explodeSubtypes = (aliases, exploded, types) => {
  for (const type of types) {
    const explodedTypes = aliases.get(type);
    if (explodedTypes) {
      for (const explodedType of explodedTypes) {
        exploded.add(explodedType);
        const subtypes = aliases.get(explodedType);
        if (subtypes) {
          explodeSubtypes(aliases, exploded, subtypes);
        }
      }
    }
  }
};

export const buildCovers = (rawAliases) => {
  const aliases = new Map();

  for (const alias of objectEntries(rawAliases)) {
    if (!isType(alias[0])) throw new Error('alias[0] key must be a string or symbol');
    if (!isArray(alias[1])) throw new Error('alias[1] must be an array');
    if (!every(isType, alias[1])) throw new Error('alias[1] values must be strings or symbols');

    aliases.set(alias[0], new Set(alias[1]));
  }

  for (const [type, types] of aliases.entries()) {
    explodeSubtypes(aliases, aliases.get(type), types);
  }

  return new Map(aliases);
};

export const getProduction = (grammar, type) => {
  return getPrototypeOf(grammar)[type];
};

export class Coroutine {
  static from(grammar, type, props) {
    const production = grammar.get(type);

    if (!production) throw new Error(`Unknown production of {type: ${type}}`);

    return new Coroutine(production.match(props));
  }

  constructor(generator) {
    this.generator = generator;
  }

  get value() {
    return this.current.value;
  }

  get done() {
    return this.current?.done;
  }

  advance(value) {
    if (this.done) {
      throw new Error('Cannot advance a coroutine that is done');
    }
    this.current = this.generator.next(value);
    return this;
  }

  return(value) {
    if (!this.done) {
      this.current = this.generator.return(value);
    } else {
      return this.current;
    }
  }

  throw(value) {
    if (!this.done) {
      this.current = { value: undefined, done: true };

      let caught = false;
      try {
        this.generator.throw(value);
      } catch (e) {
        caught = true;
      }
      if (!caught) {
        throw new Error('Generator attempted to yield a command after failing');
      }
    } else {
      throw value;
    }
  }

  finalize() {
    // ensures failures can be logged!
    if (!this.done) {
      this.return();
    }
  }
}
