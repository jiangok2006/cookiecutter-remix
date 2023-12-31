import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    return null;
};

export default function Hello() {

    return (
        <div>
            <h1>Hello Google</h1>
        </div>
    );
}