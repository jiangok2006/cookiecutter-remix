import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.spec.ts'],
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, ".") }]
  }
})


