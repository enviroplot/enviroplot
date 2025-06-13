module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    //'eslint:recommended', todo: to enable after migrating
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    'linebreak-style': 0,
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-explicit-any': ['off'], // todo: to enable after migrating
    '@typescript-eslint/explicit-module-boundary-types': ['off'], // todo: to enable after migrating
  },
};
