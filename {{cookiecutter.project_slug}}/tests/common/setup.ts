import { beforeEach } from 'vitest'
import resetDb from './reset-db'

export const httpUrl = "http://localhost:3000"

beforeEach(async () => {
  await resetDb()
})