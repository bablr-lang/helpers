export const getCooked = (token) => {
  return token.children
    .map((child) => {
      if (child.type === 'Escape') {
        return child.value.cooked;
      } else if (child.type === 'Literal') {
        return child.value;
      } else throw new Error();
    })
    .join('');
};

export const getRaw = (token) => {
  return token.children
    .map((child) => {
      if (child.type === 'Escape') {
        return child.value.raw;
      } else if (child.type === 'Literal') {
        return child.value;
      } else throw new Error();
    })
    .join('');
};
