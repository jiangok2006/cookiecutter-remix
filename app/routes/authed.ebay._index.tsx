import { json, redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { AuthProvider, auth } from "../services/auth.server";
import { getAccessToken } from "../services/oauth";
import { callApi, gTokenPairsMap } from "./authed.cj._index";

const provider = AuthProvider.ebay

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

    if (!gTokenPairsMap.get(provider) || !gTokenPairsMap.get(provider)?.accessToken) {
        let tokenPair = await getAccessToken(AuthProvider.cj, env.DB, env.ebay_host)
        if (tokenPair) {
            gTokenPairsMap.set(provider, tokenPair)
        }
    }

    if (!gTokenPairsMap.get(provider)) {
        let contentUrl = `${env.ebay_auth_host}oauth2/authorize?client_id=${env.ebay_client_id}&response_type=code&redirect_uri=${env.ebay_redirect_uri}&scope=${env.ebay_scope}&state=${env.ebay_consent_api_state}`
        return redirect(contentUrl)
    }

    return json({ products: await searchProducts(env) })
};

function BuildEbayHeader(token: string) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer v^1.1#i^1#r^0#I^3#p^3#f^0#t^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'
        },
    }
}

async function call<T>(url: string, token: string): Promise<T> {
    return await fetch(url, BuildEbayHeader(token))
        .then(response => response.json<T>())
}

async function searchProducts(env: Env): Promise<SearchProductsResponse> {
    return await callApi<SearchProductsResponse>(
        env, provider, env.ebay_host, 'buy/browse/v1/item_summary/search?q=drone&limit=3', call<SearchProductsResponse>);
}

export default function ProductList() {
    let { products } = useLoaderData<typeof loader>();

    return (<>
        <div>
            {JSON.stringify(products)}
        </div>
    </>)
}