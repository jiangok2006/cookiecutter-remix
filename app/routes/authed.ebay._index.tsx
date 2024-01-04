import { json, redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { AuthProvider, auth } from "../services/auth.server";
import { callApi, getAccessToken } from "../services/oauth";
import { gTokenPairsMap } from "./authed.cj._index";

const gProvider = AuthProvider.ebay

type ItemSummary = {
    itemId: string,
    title: string,
    itemHref: string,
    itemWebUrl: string
}

type SearchProductsResponse = {
    href: string,
    total: number,
    next: string,
    limit: number,
    offset: number,
    itemSummaries: [ItemSummary]
}

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (env.disable_auth === 'false') {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    if (!gTokenPairsMap.get(gProvider) || !gTokenPairsMap.get(gProvider)?.accessToken) {
        let tokenPair = await getAccessToken(gProvider, env)
        if (tokenPair) {
            gTokenPairsMap.set(gProvider, tokenPair)
        }
    }

    if (!gTokenPairsMap.get(gProvider)) {
        let contentUrl = `${env.ebay_auth_host}oauth2/authorize?client_id=${env.ebay_client_id}&response_type=code&redirect_uri=${env.ebay_redirect_uri}&scope=${env.ebay_scopes}&state=${env.ebay_consent_api_state}`
        return redirect(contentUrl)
    }

    return json({ products: await searchProducts(env) })
};

function BuildEbayHeader(token: string) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
}

async function call<T>(url: string, token: string): Promise<T> {
    return await fetch(url, BuildEbayHeader(token))
        .then(response => response.json<T>())
}

async function searchProducts(env: Env): Promise<SearchProductsResponse> {
    return await callApi<SearchProductsResponse>(
        env, gProvider, env.ebay_host,
        'buy/browse/v1/item_summary/search?q=drone&limit=3',
        call<SearchProductsResponse>);
}

export default function ProductList() {
    let { products } = useLoaderData<typeof loader>();

    return (<>
        <div>
            {JSON.stringify(products)}
        </div>
    </>)
}