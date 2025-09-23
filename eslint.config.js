import eslint from 'eslint';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**'
    ],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off', // Turning this off since there are many any types in the codebase
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Turning off unused vars checking for now
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    },
  },
];
