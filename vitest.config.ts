import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'lib': path.resolve(__dirname, 'lib'),
      'hooks': path.resolve(__dirname, 'hooks'),
      'components': path.resolve(__dirname, 'components'),
      'app': path.resolve(__dirname, 'app'),
    },
  },
})
