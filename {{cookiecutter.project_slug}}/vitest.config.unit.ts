import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // DO NOT use tests/common/setup.ts which reset db. unit test uses mock db.
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    }
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, ".") }]
  }
})


