const { isArray } = Array;
const arrayFirst = (arr) => arr[0];
const arrayLast = (arr) => arr[arr.length - 1];
const stripArray = (arr) => (isArray(arr) ? arr[0] : arr);

module.exports = { isArray, arrayFirst, arrayLast, stripArray };
