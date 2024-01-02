import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (env.disable_auth === 'false') {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    let contentUrl = `${env.ebay_auth_host}oauth2/authorize?client_id=${env.ebay_client_id}&response_type=code&redirect_uri=${env.ebay_redirect_uri}&scope=${env.ebay_scope}&state=${env.ebay_consent_api_state}`
    return redirect(contentUrl)
};