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

    let consent = "https://accounts.google.com/o/oauth2/v2/auth?" +
        "scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&" +
        "access_type=offline&" +
        "include_granted_scopes=true&" +
        "response_type=code&" +
        "state=state_parameter_passthrough_value&" +
        "redirect_uri=https%3A//oauth2.example.com/code&" +
        "client_id=client_id"

    return redirect(consent)
};