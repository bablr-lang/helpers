const { hasOwn } = Object;

export function* wrap(iterable) {
  yield* iterable;
}

function* __objectEntries(obj) {
  for (const key in obj) {
    if (hasOwn(obj, key)) yield [key, obj[key]];
  }
}

export function objectEntries(iterables) {
  return {
    [Symbol.iterator]() {
      return __objectEntries(iterables);
    },
  };
}

function* __concat(iterables) {
  for (const iterable of iterables) yield* iterable;
}

export function concat(iterables) {
  return {
    [Symbol.iterator]() {
      return __concat(iterables);
    },
  };
}

function* __map(iterable, fn) {
  for (const value of iterable) yield fn(value);
}

export function map(iterable, fn) {
  return {
    [Symbol.iterator]() {
      return __map(iterable, fn);
    },
  };
}
