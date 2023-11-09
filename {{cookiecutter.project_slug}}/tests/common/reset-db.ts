import prisma from '../../prisma/prisma_client'


export default async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
  ])
}