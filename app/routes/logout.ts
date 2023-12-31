import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { createCookieSessionStorageWithVars } from "../services/session.server";


export let action = async ({ request, context }: ActionFunctionArgs) => {
    console.log('logout is called')

    let env = context.env as Env;
    let { getSession, destroySession } = createCookieSessionStorageWithVars(env.cookie_secret)
    let session = await getSession(request.headers.get('Cookie'))
    await destroySession(session)
    return redirect('/login');
}
