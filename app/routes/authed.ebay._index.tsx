import { json, redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from 'uuid';
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
import { access_tokens } from "../schema/access_token";
import type { User } from "../schema/user";
import { auth } from "../services/auth.server";
import type { TokenPair } from "../services/oauth";
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
    let user: User | null = null
    if (env.disable_auth === 'false') {
        user = await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    } else {
        user = { email: env.cj_user_name } as User
    }

    let tokenPair: TokenPair | null = null
    if (!gTokenPairsMap.get(gProvider) || !gTokenPairsMap.get(gProvider)?.accessToken) {
        console.log(`ebay getting token pair from db`)
        tokenPair = await getAccessToken(user, gProvider, env)
        if (tokenPair?.accessToken && tokenPair?.accessTokenExpiryDate &&
            new Date(tokenPair.accessTokenExpiryDate) > new Date(Date.now())) {
            gTokenPairsMap.set(gProvider, tokenPair)
        }
    }

    if (!gTokenPairsMap.get(gProvider)) {
        console.log(`ebay redirecting to consent api`)

        let state = null
        if (tokenPair?.state) {
            state = tokenPair.state
        } else {
            state = uuidv4()
            let tokens = {
                email: user!.email!,
                provider: gProvider.toString(),
                state: state.toString(),
            }

            await drizzle(env.DB).insert(access_tokens).values(tokens)
                .onConflictDoUpdate(
                    {
                        target: [access_tokens.email, access_tokens.provider],
                        set: {
                            ...tokens,
                            state: sql`coalesce(${tokens.state}, excluded.state)`,
                        }
                    }).returning();
        }
        let contentUrl = `${env.ebay_auth_host}oauth2/authorize?client_id=${env.ebay_client_id}&response_type=code&redirect_uri=${env.ebay_redirect_uri}&scope=${env.ebay_scopes}&state=${state}`
        return redirect(contentUrl)
    }

    return json({ products: await searchProducts(env, user) })
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

async function searchProducts(env: Env, user: User): Promise<SearchProductsResponse> {
    return await callApi<SearchProductsResponse>(
        env, user, gProvider, env.ebay_host,
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