import { json, redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
import { auth } from "../services/auth.server";
import { callApi, getAccessToken } from "../services/oauth";
import { gTokenPairsMap } from "./authed.cj._index";

const gProvider = AuthProvider.google;

type GoogleListDrivesResponse = {
    kind: string,
    drives: [
        {
            kind: string,
            id: string,
            name: string,
            themeId: string,
            backgroundImageFile: {
                id: string,
                width: number,
                xCoordinate: number,
                yCoordinate: number
            },
            backgroundImageLink: string,
            backgroundImageAltColor: string,
            colorRgb: string,
            createdTime: string,
            restrictions: {
                adminManagedRestrictions: boolean,
                copyRequiresWriterPermission: boolean,
                domainUsersOnly: boolean,
                driveMembersOnly: boolean,
                teamMembersOnly: boolean
            }
        }
    ]
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
            console.log(`google got token pair from db`)
            gTokenPairsMap.set(gProvider, tokenPair)
        }
    }

    if (!gTokenPairsMap.get(gProvider)) {
        console.log(`google redirecting to consent api`)
        // https://developers.google.com/identity/protocols/oauth2/web-server#sample-oauth-2.0-server-response
        let params = new URLSearchParams();
        params.append('client_id', env.google_client_id!);
        params.append('redirect_uri', env.google_redirect_uri!);
        params.append('response_type', 'code');
        params.append('scope', env.google_scopes);
        params.append('state', env.google_consent_api_state);
        params.append('access_type', "offline");

        let consentUrl = `${env.google_auth_host}?${params.toString()}`
        return redirect(consentUrl)
    }

    return json({ drivers: await listDrives(env) })
};

function BuildGoogleHeader(token: string): { headers: any } {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
}

async function call<T,>(url: string, token: string): Promise<T> {
    return await fetch(url, BuildGoogleHeader(token))
        .then(response => response.json<T>())
}

async function listDrives(env: Env): Promise<GoogleListDrivesResponse> {
    return await callApi<GoogleListDrivesResponse>(
        env, gProvider, env.google_host,
        'drive/v3/drives',
        call<GoogleListDrivesResponse>);
}

export default function Google() {
    let { drivers } = useLoaderData<typeof loader>();

    return (<>
        <div>
            {JSON.stringify(drivers)}
        </div>
    </>)
}