
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../libs/orm";
import { users } from "../schema/user";
import { auth } from "../services/auth.server";

export async function action({ context, request }: ActionFunctionArgs) {
  console.log(`action triggered`)
  let env = context.env as Env;
  await auth(env.DB).logout(request, { redirectTo: "/login" });
}

export const loader: LoaderFunction = async ({ context, request }) => {
  console.log(`loader triggered`)
  let env = context.env as Env;

  console.log(`_index request.headers.get("Cookie"): ${JSON.stringify(request.headers.get("Cookie"))}`);
  console.log(`_index context: ${JSON.stringify(context)}`);

  await auth(env.DB).isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const db = drizzle(env.DB);
  const results = await db.select().from(users).all()
  return json(results);
};

export default function Index() {
  const results = useLoaderData<typeof loader>();
  return (
    <Form method="post" navigate={false} >
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <h1>Welcome to Remix</h1>
        <div>
          A value from D1:
          <pre>{JSON.stringify(results)}</pre>
        </div>
        <p>
          <button type="submit" name="_action" value="signout" >Sign out</button>
        </p>
      </div>
    </Form>
  );
}
