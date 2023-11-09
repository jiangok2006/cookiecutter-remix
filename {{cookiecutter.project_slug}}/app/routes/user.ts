import prisma from '@/app/libs/prisma';
import { Prisma } from '@prisma/client';
import { ActionFunctionArgs, json } from "@remix-run/node";


const getUsers = async () => {
    return await prisma.user.findMany()
}

export async function createUser(user: Prisma.UserCreateInput) {
    return await prisma.user.create({
        data: user,
    })
}

export const loader = async () => {
    return json({ status: 200, users: await getUsers() });
};

export async function action({ request }: ActionFunctionArgs) {
    switch (request.method) {
        case "POST": {
            const payload = await request.json();
            const user = await createUser(payload)
            return user
        }
        default: throw new Error("method is not supported!")
    }
}