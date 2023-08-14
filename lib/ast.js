export const tokenTag = (type, value = null, attrs = {}) => {
  if (!type) throw new Error();
  return { type: 'TokenTag', value: { type, value, attrs } };
};

export const gapTokenTag = (type, value = null, attrs = {}) => {
  if (!type) throw new Error();
  return { type: 'GapTokenTag', value: { type, value, attrs } };
};

export const gapNodeTag = (type, attrs = {}) => {
  if (!type) throw new Error();
  return { type: 'GapNodeTag', value: { type, attrs } };
};

export const string = (pattern) => {
  if (!pattern) throw new Error();
  return { type: 'String', value: pattern };
};

export const regex = (pattern) => {
  if (!pattern) throw new Error();
  return { type: 'Regex', value: pattern };
};
