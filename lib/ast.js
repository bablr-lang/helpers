export const tokenTag = (type, value = null, attrs = {}) => {
  if (!type) throw new Error();
  return { type: 'TokenTag', value: { type, value, attrs } };
};

export const gapTag = (type, attrs = {}) => {
  if (!type) throw new Error();
  return { type: 'GapTag', value: { type, attrs } };
};

export const stringPattern = (pattern) => {
  if (!pattern) throw new Error();
  return { type: 'StringPattern', value: pattern };
};

export const regexPattern = (pattern) => {
  if (!pattern) throw new Error();
  return { type: 'RegexPattern', value: pattern };
};
