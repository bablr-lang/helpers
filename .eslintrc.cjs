const fs = require('fs');
const { CachedInputFileSystem } = require('enhanced-resolve');

module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  extends: ['plugin:import/recommended'],
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
  },
  rules: {
    'no-undef': 'error',
  },
  globals: {
    require: 'readonly',
    module: 'readonly',
    Map: 'readonly',
    Set: 'readonly',
    WeakMap: 'readonly',
    Symbol: 'readonly',
    process: 'readonly',
  },
  settings: {
    'import/resolver': {
      'enhanced-resolve': {
        fileSystem: new CachedInputFileSystem(fs, 4000),
        conditionNames: ['import'],
      },
    },
  },
};
