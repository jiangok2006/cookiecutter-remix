import prisma from '@/app/libs/prisma'
import { beforeEach } from 'vitest'

export const httpUrl = "http://localhost:3000"

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

beforeEach(async () => {
  await resetDb()
})