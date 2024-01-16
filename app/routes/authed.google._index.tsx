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

const gProvider = AuthProvider.google;

type GoogleListFilesResponse = {
    kind: string,
    incompleteSearch: boolean,
    files: [
        {
            kind: string,
            id: string,
            name: string,
            mimeType: string,
            starred: boolean,
            trashed: boolean,
            explicitlyTrashed: boolean,
            parents: [string],
            spaces: [string],
            version: number,
            webContentLink: string,
            webViewLink: string,
            iconLink: string,
            hasThumbnail: boolean,
            thumbnailLink: string,
            thumbnailVersion: number,
            viewedByMe: boolean,
            viewedByMeTime: string,
            createdTime: string,
            modifiedTime: string,
            modifiedByMeTime: string,
            modifiedByMe: boolean,
            sharedWithMeTime: string,
            sharingUser: {
                kind: string,
                displayName: string,
                photoLink: string,
                me: boolean,
                permissionId: string,
                emailAddress: string
            },
            owners: [
                {
                    kind: string,
                    displayName: string,
                    photoLink: string,
                    me: boolean,
                    permissionId: string,
                    emailAddress: string
                }
            ],
            teamDriveId: string,
            lastModifyingUser: {
                kind: string,
                displayName: string,
                photoLink: string,
                me: boolean,
                permissionId: string,
                emailAddress: string
            },
            shared: boolean,
            ownedByMe: boolean,
            capabilities: {
                canAddChildren: boolean,
                canAddFolderFromAnotherDrive: boolean,
                canAddMyDriveParent: boolean,
                canChangeCopyRequiresWriterPermission: boolean,
                canChangeViewersCanCopyContent: boolean,
                canComment: boolean,
                canCopy: boolean,
                canDelete: boolean,
                canDeleteChildren: boolean,
                canDownload: boolean,
                canEdit: boolean,
                canListChildren: boolean,
                canModifyContent: boolean,
                canMoveChildrenOutOfDrive: boolean,
                canMoveChildrenOutOfTeamDrive: boolean,
                canMoveChildrenWithinDrive: boolean,
                canMoveChildrenWithinTeamDrive: boolean,
                canMoveItemIntoTeamDrive: boolean,
                canMoveItemOutOfDrive: boolean,
                canMoveItemOutOfTeamDrive: boolean,
                canMoveItemWithinDrive: boolean,
                canMoveItemWithinTeamDrive: boolean,
                canMoveTeamDriveItem: boolean,
            }
        }]
}

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
        tokenPair = await getAccessToken(user, gProvider, env)
        if (tokenPair?.accessToken && tokenPair?.accessTokenExpiryDate &&
            new Date(tokenPair.accessTokenExpiryDate) > new Date(Date.now())) {
            console.log(`google got token pair from db`)
            gTokenPairsMap.set(gProvider, tokenPair)
        }
    }

    if (!gTokenPairsMap.get(gProvider)) {
        console.log(`google redirecting to consent api`)
        // https://developers.google.com/identity/protocols/oauth2/web-server#sample-oauth-2.0-server-response

        // Step 1: Set authorization parameters
        // https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient

        // Why I don't need to do STEP 1?
        // Why I cannot get refresh_token at all?

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

        let params = new URLSearchParams();
        params.append('client_id', env.google_client_id!);
        params.append('redirect_uri', env.google_redirect_uri!);
        params.append('response_type', 'code');
        params.append('scope', env.google_scopes);
        params.append('state', state);
        // Again, refresh_token is only present in this response if you set the access_type parameter 
        // to offline in the initial request to Google's authorization server. 
        params.append('access_type', 'offline');

        // Step 2: Redirect to Google's OAuth 2.0 server
        // https://developers.google.com/identity/protocols/oauth2/web-server#redirecting
        let consentUrl = `${env.google_auth_host}?${params.toString()}`
        return redirect(consentUrl)
    }

    return json({ resp: await listFiles(env, user) })
};

function BuildGoogleHeader(token: string): { headers: any } {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
}

async function call<T>(url: string, token: string): Promise<T> {
    return await fetch(url, BuildGoogleHeader(token))
        .then(response => response.json<T>())
}

async function listFiles(env: Env, user: User): Promise<GoogleListFilesResponse> {
    return await callApi<GoogleListFilesResponse>(
        env, user, gProvider, env.google_host,
        '/drive/v3/files',
        call<GoogleListFilesResponse>);
}

export default function Google() {
    let { resp } = useLoaderData<typeof loader>();
    console.log(`google resp: ${resp}`)
    function buildCards(resp: GoogleListFilesResponse) {
        return resp.files.map((file) => {
            return (
                <div className="max-w-sm rounded overflow-hidden shadow-lg" key={file.id}>
                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{file.name}</div>
                        <div className="font-bold text-xl mb-2">{file.kind}</div>
                    </div>
                </div>)
        })
    }

    return (<>
        {buildCards(resp)}
    </>)
}