/**
 * Config ESLint (ESLint 8 + @typescript-eslint 6) do backend.
 * - `no-explicit-any` fica como warn: o código legado ainda tem `any`,
 *   mas o lint continua falhando (exit code) para erros reais.
 * - `no-undef` é desligado porque o TypeScript já cobre isso via `tsc --noEmit`.
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', 'node_modules', 'coverage', '*.config.js', '*.config.cjs'],
  rules: {
    'no-undef': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-console': 'off',
    'prefer-const': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
};
