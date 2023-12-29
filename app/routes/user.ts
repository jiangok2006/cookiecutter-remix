import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { getDb } from "../libs/orm";
import type { User } from "../schema/user";
import { users } from "../schema/user";
import { auth } from "../services/auth.server";

export const loader: LoaderFunction = async ({ request, context }) => {
    let env = context.env as Env;
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .isAuthenticated(request, { failureRedirect: '/login' })

    const data = getDb(context).select().from(users)
    return data;
};

export async function action({ request, context }: ActionFunctionArgs) {
    let env = context.env as Env;
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .isAuthenticated(request, { failureRedirect: '/login' })

    switch (request.method) {
        case "POST": {
            const payload = await request.json<User>();
            return await getDb(context).insert(users).values(payload);
        }
        default: throw new Error("method is not supported!")
    }
}