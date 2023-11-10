import prisma from '@/app/libs/prisma'
import { beforeAll, beforeEach } from 'vitest'

export const httpUrl = process.env.APP_HTTP_URL

export const newUser = {
  name: 'test',
  email: 'test@abc.com',
  is_test: true,
}

async function resetDb() {
  console.log('resetDb...')
  prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.post.deleteMany(),
  ])
}

beforeAll(() => {
  console.log(`httpUrl: ${httpUrl}`)
})

beforeEach(async () => {
  await resetDb()
})