import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { createCookieSessionStorageWithVars } from "../services/session.server";

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log('logout is called')

    let env = context.env as Env;
    let { getSession, destroySession } = createCookieSessionStorageWithVars(env.cookie_secret)
    let session = await getSession(request.headers.get('Cookie'))
    await destroySession(session)
    return redirect('/login');
}
