
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
    Link,
    Outlet
} from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";


export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    console.log('env.disable_auth', env.disable_auth)
    if (env.disable_auth === 'false') {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    return null
};


export default function Index() {
    return (
        <>
            <div className="flex flex-row bg-stone-300">
                <span className="p-6">MyCoolApp</span>
                <Link to="/authed/cj" className="p-6 bg-orange-300 hover:bg-orange-100">CJ</Link>
                <Link to="/authed/ebay" className="p-6 bg-orange-300 hover:bg-orange-100">eBay</Link>
                <Link to="/authed/google" className="p-6 bg-orange-300 hover:bg-orange-100">Google</Link>
            </div>
            <div className="p-5">
                <Outlet />
            </div>
        </>
    )
}