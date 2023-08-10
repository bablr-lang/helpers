export const find = (fn, iterable) => {
  for (const value of iterable || []) {
    if (fn(value)) return value;
  }
  return null;
};

export const map = (fn, iterable) => ({
  *[Symbol.iterator]() {
    for (const value of iterable || []) yield fn(value);
  },
});

export const flatMap = (fn, iterable) => ({
  *[Symbol.iterator]() {
    for (const value of iterable || []) yield* fn(value);
  },
});

export const concat = (...iterables) => ({
  *[Symbol.iterator]() {
    for (const iterable of iterables) if (iterable != null) yield* iterable;
  },
});

export const strFrom = (chrs) => {
  let str = '';
  for (const chr of chrs) str += chr;
  return str;
};
