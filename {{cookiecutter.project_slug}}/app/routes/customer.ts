import { ActionFunctionArgs, LoaderFunction } from "@remix-run/cloudflare";
import { customers } from "../../schema/customers";
import { NewCustomer, getDb } from "../libs/orm";

export const loader: LoaderFunction = async ({ context }) => {
    const data = getDb(context).select().from(customers)
    return data;
};

export async function action({ context, request }: ActionFunctionArgs) {
    switch (request.method) {
        case "POST": {
            const payload = await request.json<NewCustomer>();
            return await getDb(context).insert(customers).values(payload);
        }
        default: throw new Error("method is not supported!")
    }
}