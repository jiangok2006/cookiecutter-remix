import type { LoaderFunction } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { getDb } from "../libs/orm";
import { users } from "../schema/user";

export const loader: LoaderFunction = async ({ context, params }) => {
    if (!params.id) throw new Response("", { status: 404 });
    const data = getDb(context).select().from(users).where(eq(users.id, Number(params.id)))
    return data;
};
