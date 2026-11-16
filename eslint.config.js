// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// `tseslint.config()` is deprecated in favour of ESLint core's `defineConfig()`.
export default defineConfig(
  globalIgnores(['dist/', 'node_modules/', 'coverage/']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-globals': [
        'error',
        { name: 'eval', message: 'Never evaluate source as JavaScript.' },
      ],
      'no-new-func': 'error',
      'no-eval': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
