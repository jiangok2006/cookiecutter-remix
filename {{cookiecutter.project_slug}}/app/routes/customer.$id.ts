import { LoaderFunction } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { customers } from "../../schema/customers";
import { getDb } from "../libs/orm";

export const loader: LoaderFunction = async ({ context, params }) => {
    if (!params.id) throw new Response("", { status: 404 });
    const data = getDb(context).select().from(customers).where(eq(customers.id, params.id))
    return data;
};
