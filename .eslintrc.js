module.exports = {
  root: true,
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  plugins: ['@typescript-eslint', 'import', 'html'],
  rules: {
    // disable the rule for all files
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/no-duplicates': 'off',
    'prefer-const': 'off',
    'import/named': 'off',
    'import/no-unresolved': 'off',
  },
};
