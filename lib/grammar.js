import every from 'iter-tools-es/methods/every';
import isString from 'iter-tools-es/methods/is-string';
import objectEntries from 'iter-tools-es/methods/object-entries';
import { getPrototypeOf } from './object.js';
import { OpenNodeTag, CloseNodeTag } from './symbols.js';

const { isArray } = Array;
const isSymbol = (value) => typeof value === 'symbol';
const isType = (value) => isString(value) || isSymbol(value);

export const resolveLanguage = (context, language, path) => {
  if (isString(path)) {
    if (language.canonicalURL === path) {
      return language;
    } else {
      throw new Error('absolute path resolution not implemented');
    }
  }

  let l = language;

  if (!l) {
    throw new Error();
  }

  if (path == null) {
    return language;
  } else if (isString(path)) {
    l = l.dependencies[path];
  } else if (isArray(path)) {
    for (const segment of path) {
      l = l.dependencies[segment];
    }
  } else {
    throw new Error();
  }

  return l;
};

export const unresolveLanguage = (context, baseLanguage, absoluteLanguage) => {
  if (absoluteLanguage == null || absoluteLanguage === baseLanguage.canonicalURL) {
    return null;
  }

  for (const { 0: key, 1: value } of objectEntries(baseLanguage.dependencies)) {
    if (value.canonicalURL === absoluteLanguage) {
      return [key];
    }
  }

  throw new Error('Cannot currently unresolve nested deps');
};

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

const __buildDependentLanguages = (language, languages = new Map()) => {
  for (const dependentLanguage of Object.values(language.dependencies || {})) {
    const { canonicalURL } = dependentLanguage;
    if (languages.has(canonicalURL) && dependentLanguage !== languages.get(canonicalURL)) {
      throw new Error();
    }

    if (!languages.has(dependentLanguage)) {
      __buildDependentLanguages(dependentLanguage, languages);
    }
  }
  languages.set(language.canonicalURL, language);

  return languages;
};

export const buildDependentLanguages = (language, transformLanguage = (l) => l) => {
  return __buildDependentLanguages(language);
};

const arrayLast = (arr) => arr[arr.length - 1];

export function* zipLanguages(tags, rootLanguage) {
  const languages = [rootLanguage];

  for (const tag of tags) {
    switch (tag.type) {
      case OpenNodeTag: {
        if (tag.value.language) {
          const dependentLanguage = languages.dependencies[tag.value.language];

          if (!dependentLanguage) throw new Error('language was not a dependency');

          languages.push(dependentLanguage);
        }
        break;
      }

      case CloseNodeTag: {
        if (tag.value.language !== arrayLast(languages).canonicalURL) {
          languages.pop();
        }
        break;
      }
    }

    yield [tag, arrayLast(languages)];
  }
}
