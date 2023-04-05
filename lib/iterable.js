export const map = (fn, iterable) => ({
  *[Symbol.iterator]() {
    for (const value of iterable || []) yield fn(value);
  },
});

export const concat = (...iterables) => ({
  *[Symbol.iterator]() {
    for (const iterable of iterables) if (iterable != null) yield* iterable;
  },
});
