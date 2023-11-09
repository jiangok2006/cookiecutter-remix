import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    threads: false,
    setupFiles: ['tests/common/setup.ts'],
    testTimeout: 10000
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, ".") }]
  }
})
