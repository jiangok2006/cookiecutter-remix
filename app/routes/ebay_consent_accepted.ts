import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
import { access_tokens } from "../schema/access_token";
import { encodeBase64, saveToDb } from "../services/oauth";

type EbayTokenResponse = {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    refresh_token_expires_in: number,
}

export function getSecondsFromNow(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
}

export function convertSecondsExpiryToDate(seconds: number): number {
    // getTime() returns milliseconds
    return Math.round(getSecondsFromNow(seconds).getTime() / 1000)
}

const gProvider = AuthProvider.ebay;

export async function exchangeOrRefreshAccessToken(env: Env, body: URLSearchParams): Promise<Response> {
    let secret = `${env.ebay_client_id}:${env.ebay_client_secret}`
    let encodedSecret = encodeBase64(secret);

    return await fetch(`${env.ebay_host}identity/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedSecret}`,
        },
        body: body,
    });
}

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const authCode = url.searchParams.get("code");

    let filter = and(
        eq(access_tokens.state, state!),
        eq(access_tokens.provider, gProvider))
    let rows = await drizzle(env.DB).select().from(access_tokens).where(filter).execute();

    if (state !== rows[0].state) {
        throw new Error(`consent is accepted, but state is not matched. state: ${state}`)
    }

    try {
        let body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('code', authCode!);
        body.append('redirect_uri', env.ebay_redirect_uri!);

        const response = await exchangeOrRefreshAccessToken(env, body);

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }

        const resp = await response.json<EbayTokenResponse>();
        console.log(`resp: ${JSON.stringify(resp)}`);
        if (!resp.access_token) {
            throw new Error(`getting token failed: ${JSON.stringify(resp)}`);
        }

        await saveToDb(env.DB,
            rows[0],
            gProvider,
            resp.access_token,
            resp.expires_in,
            resp.refresh_token,
            resp.refresh_token_expires_in,
        )
        return redirect('/authed/ebay');
    } catch (e) {
        throw new Error(`exchanging ebay auth code with tokens failed: ${e}`)
    }
};


