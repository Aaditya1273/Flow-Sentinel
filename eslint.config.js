const nextPlugin = require('eslint-config-next')

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
    ],
  },
  ...(Array.isArray(nextPlugin) ? nextPlugin : [nextPlugin]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-extra-boolean-cast': 'error',
    },
  },
]

module.exports = config
