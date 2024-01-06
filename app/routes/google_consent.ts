import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
import { saveToDb } from "../services/oauth";

const gProvider = AuthProvider.google;

type GoogleTokenResponse = {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    refresh_token: string | null; // https://stackoverflow.com/questions/10827920/not-receiving-google-oauth-refresh-token
}

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`consent is accepted. request.url: ${request.url}`);
    let env = context.env as Env;
    const url = new URL(request.url);
    console.log(`url: ${url}`);
    const state = url.searchParams.get("state");
    const authCode = url.searchParams.get("code");

    if (state !== env.google_consent_api_state) {
        throw new Error(`consent is accepted, but state is not matched. state: ${state}`)
    }

    try {
        // https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
        let params = new URLSearchParams();
        params.append('client_id', env.google_client_id!);
        params.append('client_secret', env.google_client_secret);
        params.append('code', authCode!);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', env.google_redirect_uri!);

        let url = `${env.google_oauth_host}?${params.toString()}`
        console.log(`url2: ${url}`);
        const response = await fetch(url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }

        const resp = await response.json<GoogleTokenResponse>();
        if (!resp.access_token) {
            throw new Error(`getting token failed: ${JSON.stringify(resp)}`);
        }

        await saveToDb(env.DB, gProvider, resp.access_token,
            resp.expires_in, resp.refresh_token,
            null)

        return redirect('/authed/google');
    } catch (e) {
        throw new Error(`exchanging google auth code with tokens failed: ${e}`)
    }
};


