import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
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

const gProvider = AuthProvider.ebay;

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`consent is accepted. request.url: ${request.url}`);
    let env = context.env as Env;
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const authCode = url.searchParams.get("code");

    if (state !== env.ebay_consent_api_state) {
        throw new Error(`consent is accepted, but state is not matched. state: ${state}`)
    }

    try {
        let secret = `${env.ebay_client_id}:${env.ebay_client_secret}`
        let encodedSecret = encodeBase64(secret);

        let body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('code', authCode!);
        body.append('redirect_uri', env.ebay_redirect_uri!);

        const response = await fetch(`${env.ebay_host}identity/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedSecret}`,
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }

        const resp = await response.json<EbayTokenResponse>();
        if (!resp.access_token) {
            throw new Error(`getting token failed: ${JSON.stringify(resp)}`);
        }
        await saveToDb(env.DB, gProvider,
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


