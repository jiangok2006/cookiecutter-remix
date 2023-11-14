import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from 'drizzle-orm/d1';
import { customers } from "../../schema/customers";
import { Env } from "../libs/orm";


export const loader: LoaderFunction = async ({ context, params }) => {
  let env = context.env as Env;
  console.log(context.env);
  const db = drizzle(env.DB);
  const results = await db.select().from(customers).all()
  return json(results);
};

export default function Index() {
  const results = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <div>
        A value from D1:
        <pre>{JSON.stringify(results)}</pre>
      </div>
    </div>
  );
}
