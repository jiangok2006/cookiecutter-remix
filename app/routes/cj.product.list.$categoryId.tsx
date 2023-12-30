import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { getCJAccessToken } from "../services/cj";
import type { CJProductListAPIResponse } from "./cj.product.list";



export let loader: LoaderFunction = async ({ params, request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    let suffix = params.categoryId === 'all' ? '' : `?categoryId=${params.categoryId}`
    console.log(`suffix: ${suffix}`)
    let token = await getCJAccessToken(env.DB, env.cj_host, env.cj_user_name, env.cj_api_key)
    let res = await fetch(`${env.cj_host}v1/product/list${suffix}`, {
        headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': token
        },
    })
        .then(response => response.json<CJProductListAPIResponse>())

    return res;
};


export default function ProductList() {
    let data = useLoaderData();
    return (
        <div>
            filteredResults: {JSON.stringify(data, null, 2)}
        </div>
    );
}