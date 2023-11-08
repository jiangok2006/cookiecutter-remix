import prisma from '@/app/libs/__mocks__/prisma';
import { createUser } from '@/app/routes/_index';
import { expect, test, vi } from 'vitest';

vi.mock('@/app/libs/prisma')

test('createUser should return the generated user', async () => {
  const newUser = { email: 'user@prisma.io', name: 'Prisma Fan' }
  prisma.user.create.mockResolvedValue({ ...newUser, id: 1 })
  const user = await createUser(newUser)
  expect(user).toStrictEqual({ ...newUser, id: 1 })
})