import prisma from '@/app/libs/prisma'

export default async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
  ])
}