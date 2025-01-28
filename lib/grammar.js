import every from 'iter-tools-es/methods/every';
import isString from 'iter-tools-es/methods/is-string';
import { getOwnPropertySymbols, getPrototypeOf, objectEntries } from './object.js';
import { OpenNodeTag, CloseNodeTag } from './symbols.js';
import {
  buildCall,
  buildExpression,
  buildIdentifier,
  buildTuple,
  buildTupleValues,
} from './builders.js';

export * from './decorators.js';

const { getOwnPropertyNames, hasOwn } = Object;

const { isArray } = Array;
const isSymbol = (value) => typeof value === 'symbol';
const isType = (value) => isString(value) || isSymbol(value);

export const mapProductions = (fn, Grammar) => {
  let { prototype } = Grammar;

  class MappedGrammar extends Grammar {}

  const mapped = MappedGrammar.prototype;

  while (prototype && prototype !== Object.prototype) {
    for (const key of [...getOwnPropertyNames(prototype), ...getOwnPropertySymbols(prototype)]) {
      if (!hasOwn(mapped, key)) {
        mapped[key] = fn(prototype[key], key);
      }
    }
    prototype = getPrototypeOf(prototype);
  }

  return MappedGrammar;
};

export function* generateProductions(Grammar) {
  let { prototype } = Grammar;

  while (prototype && prototype !== Object.prototype) {
    for (const key of [...getOwnPropertyNames(prototype), ...getOwnPropertySymbols(prototype)]) {
      let value = prototype[key];
      if (key !== 'constructor') yield [key, value];
    }
    prototype = getPrototypeOf(prototype);
  }
}

export const resolveLanguage = (context, language, path) => {
  const { languages } = context;
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

  let segments = isString(path) ? [path] : isArray(path) ? path : null;

  if (path == null) {
    return language;
  } else {
    for (const segment of segments) {
      if (isString(l.dependencies[segment])) {
        l = languages.get(l.dependencies[segment]);
      } else {
        l = l.dependencies[segment];
      }
    }
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
  languages.set(language.canonicalURL, language);

  for (const dependentLanguage of Object.values(language.dependencies || {})) {
    if (isString(dependentLanguage)) continue;

    const { canonicalURL } = dependentLanguage;
    if (languages.has(canonicalURL) && dependentLanguage !== languages.get(canonicalURL)) {
      throw new Error();
    }

    if (!languages.has(dependentLanguage)) {
      __buildDependentLanguages(dependentLanguage, languages);
    }
  }

  return languages;
};

export const buildDependentLanguages = (language) => {
  return __buildDependentLanguages(language);
};

export const extendLanguage = (language, extension) => {
  return {
    ...language,
    dependencies: extension.dependencies
      ? { ...language.dependencies, ...extension.dependencies }
      : language.dependencies,
    canonicalURL: language.canonicalURL,
    grammar: extension.grammar,
  };
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

const safeShallowEmbed = (value) => {
  if (typeof value !== 'object') {
    return buildExpression(value);
  } else {
    return value;
  }
};

const __buildCall = (verb, ...args) => {
  while (args.length && args[args.length - 1] === undefined) {
    args.pop();
  }

  return buildCall(buildIdentifier(verb), buildTuple(buildTupleValues(args.map(safeShallowEmbed))));
};

export const eat = (matcher, props, options) => {
  return __buildCall('eat', matcher, props, options);
};

export const eatMatch = (matcher, props, options) => {
  return __buildCall('eatMatch', matcher, props, options);
};

export const match = (matcher, props, options) => {
  return __buildCall('match', matcher, props, options);
};

export const guard = (matcher, props, options) => {
  return __buildCall('guard', matcher, props, options);
};

export const holdForMatch = (matcher, props, options) => {
  return __buildCall('holdForMatch', matcher, props, options);
};

export const fail = () => {
  return __buildCall('fail');
};

export const bindAttribute = (key, value) => {
  return __buildCall('bindAttribute', key, value);
};

export const write = (value) => {
  return __buildCall('write', value);
};

export const e = buildExpression;
