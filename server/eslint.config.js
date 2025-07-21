import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['migrations/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^client$' }],
    },
  },
  {
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'tests/**'],
  },
  {
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
    },
  },
];
