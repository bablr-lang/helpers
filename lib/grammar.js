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

export const buildDependentLanguages = (language) => {
  const languages = new Map();

  const stack = [language];

  while (stack.length) {
    const language = stack[stack.length - 1];
    languages.set(language.canonicalURL, language);
    for (const { 1: dependentLanguage } of Object.entries(language.dependencies || {})) {
      const { canonicalURL } = dependentLanguage;
      if (languages.has(canonicalURL) && dependentLanguage !== languages.get(canonicalURL)) {
        throw new Error();
      }
    }
    stack.pop();
    stack.push(...Object.values(language.dependencies || {}));
  }

  return languages;
};
