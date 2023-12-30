import { type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { getCJAccessToken } from "../services/cj";


// cloudfare page read env vars from .dev.vars
export let loader: LoaderFunction = async ({ context, request }: LoaderFunctionArgs) => {
  let env = context.env as Env;
  if (!env.disable_auth) {
    await auth(
      env.DB,
      env.magic_link_secret,
      env.cookie_secret)
      .isAuthenticated(request, { failureRedirect: '/login' })
  }

  return await getCJAccessToken(
    env.DB, env.cj_host, env.cj_user_name, env.cj_api_key);
};

export default function Index() {
  let data = useLoaderData();

  return (
    <div>
      <h1>Data from CJ token API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}