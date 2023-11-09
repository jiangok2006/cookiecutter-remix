import prisma from '@/app/libs/__mocks__/prisma';
import { createUser } from '@/app/routes/user';
import { newUser } from '@/tests/common/setup';
import { expect, test, vi } from 'vitest';

vi.mock('@/app/libs/prisma')

test('createUser should return the generated user', async () => {
  const data = { ...newUser }
  prisma.user.create.mockResolvedValue(data)
  const user = await createUser(newUser)
  expect(user).toStrictEqual(data)
})