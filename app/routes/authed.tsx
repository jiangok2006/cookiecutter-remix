
import { type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
    Link,
    Outlet,
    useLoaderData
} from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";


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


export default function Index() {
    let { user } = useLoaderData<typeof loader>()

    return (
        <>
            <div className="h-16 flow-root bg-slate-100">
                <div className="flex flex-row h-full float-left  ">
                    <div className="p-5">MyCoolApp</div>
                    <Link to="/authed/cj" className="p-5  bg-orange-300 hover:bg-orange-100 ">CJ</Link>
                    <Link to="/authed/ebay" className="p-5  bg-orange-300 hover:bg-orange-100 ">eBay</Link>
                    <Link to="/authed/google" className="p-5 bg-orange-300 hover:bg-orange-100">Google</Link>
                </div>
                <div className="flex flex-row-reverse h-full float-right">
                    <Link to="/logout" className=" p-5 bg-orange-300 hover:bg-orange-100 ">Logout</Link>
                    <div className="p-5">{user?.email ?? "localtest"}</div>
                </div>
            </div>
            <div className="p-5">
                <Outlet />
            </div>
        </>
    )
}