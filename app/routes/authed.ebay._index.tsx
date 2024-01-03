import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { AuthProvider, auth } from "../services/auth.server";
import { getAccessToken } from "../services/oauth";
import { gTokenPairsMap } from "./authed.cj._index";

const provider = AuthProvider.ebay

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (env.disable_auth === 'false') {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    console.log('loader', gTokenPairsMap.get(provider))
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
};