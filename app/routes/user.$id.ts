import type { LoaderFunction } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import type { Env } from "../libs/orm";
import { getDb } from "../libs/orm";
import { users } from "../schema/user";
import { auth } from "../services/auth.server";

export const loader: LoaderFunction = async ({ request, context, params }) => {
    let env = context.env as Env;
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .isAuthenticated(request, { failureRedirect: '/login' })

    if (!params.id) throw new Response("", { status: 404 });
    const data = getDb(context).select().from(users).where(eq(users.id, Number(params.id)))
    return data;
};
