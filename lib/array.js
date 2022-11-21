export const { isArray } = Array;

export const arrayFirst = (arr) => arr[0];

export const arrayLast = (arr) => arr[arr.length - 1];

export const stripArray = (arr) => (isArray(arr) ? arr[0] : arr);
