import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/cloudflare";
import { getDb } from "../libs/orm";
import type { User } from "../schema/user";
import { users } from "../schema/user";

export const loader: LoaderFunction = async ({ context }) => {
    const data = getDb(context).select().from(users)
    return data;
};

export async function action({ context, request }: ActionFunctionArgs) {
    switch (request.method) {
        case "POST": {
            const payload = await request.json<User>();
            return await getDb(context).insert(users).values(payload);
        }
        default: throw new Error("method is not supported!")
    }
}