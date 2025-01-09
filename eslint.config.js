import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '.yarn',
      '**/dist',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    semi: true,
    arrowParens: true,
    braceStyle: '1tbs',
  }),
  {
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'perfectionist/sort-imports': ['error', {
        newlinesBetween: 'always',
        groups: [
          ['builtin', 'external', 'type'],
          [
            'internal', 'internal-type',
            'parent', 'parent-type',
            'sibling', 'sibling-type',
            'index', 'index-type',
          ],
        ],
      }],
    },
  },
  {
    files: ['**/src/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['./*', '../*'],
          message: 'Relative imports are not allowed, use absolute imports instead.',
        }],
      }],
    },
  },
];
