
import { redirect, type ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
    Form,
    Link,
    Outlet,
    useLoaderData
} from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { createCookieSessionStorageWithVars } from "../services/session.server";


export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    console.log('env.disable_auth', env.disable_auth)
    let user: { id: number; email: string | null; created_at: Date; updated_at: Date; } | null = null;
    if (env.disable_auth === 'false') {
        user = await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    return { user };
};

export let action = async ({ request, context }: ActionFunctionArgs) => {
    let env = context.env as Env;

    let { getSession, destroySession } = createCookieSessionStorageWithVars(env.cookie_secret)
    let session = await getSession(request.headers.get('Cookie'))
    await destroySession(session)
    return redirect('/login');
}



export default function Index() {
    let { user } = useLoaderData<typeof loader>()

    return (
        <>
            <div className="flow-root bg-stone-300 ">
                <div className="float-left p-6">
                    <span className="p-6">MyCoolApp</span>
                    <Link to="/authed/cj" className="p-6 bg-orange-300 hover:bg-orange-100">CJ</Link>
                    <Link to="/authed/ebay" className="p-6 bg-orange-300 hover:bg-orange-100">eBay</Link>
                    <Link to="/authed/google" className="p-6 bg-orange-300 hover:bg-orange-100">Google</Link>
                </div>
                <div className="float-right p-6 ">
                    <span className="p-6">{user?.email ?? "localtest"}</span>
                    <Form method="post">
                        <button type="submit" className="p-6 bg-orange-300 hover:bg-orange-100" >Logout</button>
                    </Form>
                </div>
            </div>
            <div className="p-5">
                <Outlet />
            </div>
        </>
    )
}