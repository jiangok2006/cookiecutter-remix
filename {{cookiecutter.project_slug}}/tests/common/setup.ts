import { beforeAll, beforeEach } from 'vitest'

export const httpUrl = process.env.APP_HTTP_URL

export const newUser = {
  name: 'test',
  email: 'test@abc.com',
  is_test: true,
}

async function resetDb() {
  console.log('resetDb...')

}

beforeAll(() => {
  console.log(`httpUrl: ${httpUrl}`)
})

beforeEach(async () => {
  await resetDb()
})