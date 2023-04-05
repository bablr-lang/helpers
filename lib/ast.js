const { isArray } = Array;

export class Resolver {
  static from(node) {
    return new Resolver(node);
  }

  constructor(node, counters = new Map()) {
    this.node = node;
    this.counters = counters; // {[property]: counter}
  }

  consume(name) {
    const { node, counters } = this;

    let path = name;

    if (isArray(node[name])) {
      const count = counters.get(name) || 0;

      path += '.' + count;
      counters.set(name, count + 1);
    }
    return path;
  }

  resolve(name) {
    const { node, counters } = this;

    let path = name;

    if (isArray(node[name])) {
      const count = counters.get(name) || 0;

      path += '.' + count;
    }

    return path;
  }
}
