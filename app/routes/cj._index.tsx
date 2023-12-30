import { type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { getCJAccessToken } from "../services/cj";

type CJSettingAPIResponse = {
    code: number,
    message: string,
    success: boolean,
    data: {
    }
}
export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    let token = await getCJAccessToken(env.DB, env.cj_host, env.cj_user_name, env.cj_api_key)
    let res = await fetch(`${env.cj_host}v1/setting/get`, {
        headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': token
        },
    })
        .then(response => response.json<CJSettingAPIResponse>())

    return res;
};

export default function HelloCJ() {
    let data = useLoaderData();

    return (
        <div>
            <h1>Data from CJ setting API:</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}