import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/common/setup.ts'],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    }
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, ".") }]
  }
})


