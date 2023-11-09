import { beforeEach } from 'vitest';
import resetDb from './reset-db';

export const httpUrl = "http://localhost:3000"

export const newUser = {
  name: 'test',
  email: 'test@abc.com'
}

beforeEach(async () => {
  await resetDb()
})