import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Buffer } from 'node:buffer';
import type { Env } from "../libs/orm";
import { AuthProvider } from "../libs/types";
import { gTokenPairsMap } from "../routes/authed.cj._index";
import { getSecondsFromNow } from "../routes/ebay_consent_accepted";
import type { AccessToken } from "../schema/access_token";
import { access_tokens } from "../schema/access_token";


export type TokenPair = {
    accessToken: string | null,
    refreshToken: string | null
}

type CJAccessTokenAPIResponse = {
    code: number,
    message: string,
    success: boolean,
    data: {
        accessToken: string,
        accessTokenExpiryDate: string,
        refreshToken: string,
        refreshTokenExpiryDate: string,
    }
}

type EbayRefreshTokenAPIResponse = {
    access_token: string,
    expires_in: number,
    token_type: string,
}

type GoogleRefreshTokenAPIResponse = {
    access_token: string,
    expires_in: number,
    token_type: string,
    scope: string,
}

export let getAccessToken = async (
    provider: AuthProvider, env: Env
): Promise<TokenPair | null> => {
    let filter = eq(access_tokens.provider, provider)
    let rows = await drizzle(env.DB).select().from(access_tokens).where(filter).execute();
    if (rows.length == 0) {
        return recreateTokens(provider, env)
    }

    let row = rows[0] as AccessToken
    return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token
    }
}

async function recreateTokens(
    provider: AuthProvider, env: Env
): Promise<TokenPair | null> {
    switch (provider) {
        case AuthProvider.cj:
            return await recreateCJTokens(env);
        case AuthProvider.ebay:
        case AuthProvider.google:
            // ebay and google need oauth consent.
            return null;
        default:
            throw new Error(`invalid auth provider: ${provider}`)
    }
}



async function recreateCJTokens(env: Env):
    Promise<TokenPair | null> {
    let resp = await fetch(`${env.cj_host}v1/authentication/getAccessToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: env.cj_user_name,
            password: env.cj_api_key
        })
    })
        .then(response => response.json<CJAccessTokenAPIResponse>())

    if (!resp.success) {
        throw new Error(`failed to get access token: ${resp.message}`)
    }

    return await saveToDb(env.DB, AuthProvider.cj, resp.data.accessToken,
        resp.data.accessTokenExpiryDate, resp.data.refreshToken,
        resp.data.refreshTokenExpiryDate)
}


export let refreshAccessToken = async (
    provider: AuthProvider,
    env: Env,
    refreshToken: string,
): Promise<TokenPair | null> => {
    try {
        switch (provider) {
            case AuthProvider.cj:
                return await refreshCJTokens(
                    env, refreshToken);
            case AuthProvider.ebay:
                return await refreshEbayTokens(
                    env, refreshToken);
            case AuthProvider.google:
                return await refreshGoogleTokens(
                    env, refreshToken);
        }
    } catch (e) {
        console.error(`callApi failed: ${e}`)

        // if refresh token stop working
        return await recreateTokens(
            provider, env);
    }
}


async function refreshCJTokens(
    env: Env,
    refreshToken: string): Promise<TokenPair | null> {

    let resp = await fetch(`${env.cj_host}v1/authentication/refreshAccessToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refreshToken: refreshToken
        })
    })
        .then(response => response.json<CJAccessTokenAPIResponse>())

    return await saveToDb(env.DB, AuthProvider.cj, resp.data.accessToken,
        resp.data.accessTokenExpiryDate, resp.data.refreshToken,
        resp.data.refreshTokenExpiryDate)
}

export function encodeBase64(str: string): string {
    return Buffer.from(str).toString('base64');
}

async function refreshEbayTokens(
    env: Env, refreshToken: string
): Promise<TokenPair | null> {
    // https://developer.ebay.com/api-docs/static/oauth-refresh-token-request.html

    let secret = `${env.ebay_client_id}:${env.ebay_client_secret}`
    let encodedSecret = encodeBase64(secret);

    let resp = await fetch(env.google_oauth_host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedSecret}`
        },
        body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: env.ebay_scopes,
        })
    })
        .then(response => response.json<EbayRefreshTokenAPIResponse>())

    return await saveToDb(env.DB, AuthProvider.ebay, null,
        null, resp.access_token,
        resp.expires_in)
}

async function refreshGoogleTokens(
    env: Env, refreshToken: string
): Promise<TokenPair | null> {
    // https://developers.google.com/identity/protocols/oauth2/web-server#offline
    let resp = await fetch(env.google_oauth_host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: env.google_client_id,
            client_secret: env.google_client_secret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    })
        .then(response => response.json<GoogleRefreshTokenAPIResponse>())

    return await saveToDb(env.DB, AuthProvider.google, null,
        null, resp.access_token,
        resp.expires_in)
}

export async function saveToDb(
    db: D1Database,
    provider: AuthProvider,
    accessToken: string | null,
    accessTokenExpiry: string | number | null,
    refreshToken: string | null,
    refreshTokenExpiry: string | number | null):
    Promise<TokenPair> {
    function getExpiresIn(expiry: string | number | null): Date | null {
        if (expiry == null) {
            return null;
        }
        // cj uses date string
        if (typeof expiry === 'string') {
            return new Date(expiry);
        }
        // google and ebay use seconds
        return getSecondsFromNow(expiry);
    }

    let existing = await drizzle(db)
        .select().from(access_tokens)
        .where(eq(access_tokens.provider, provider)).execute();
    let existing_row = existing.length > 0 ? existing[0] : null;

    let tokens = {
        provider: provider,
        access_token: accessToken ?? existing_row?.access_token,
        access_token_expires_at: getExpiresIn(accessTokenExpiry) ?? existing_row?.access_token_expires_at,
        refresh_token: refreshToken ?? existing_row?.refresh_token,
        refresh_token_expires_at: getExpiresIn(refreshTokenExpiry) ?? existing_row?.refresh_token_expires_at,
    }
    let rows = await drizzle(db).insert(access_tokens).values(tokens)
        .onConflictDoUpdate(
            {
                target: access_tokens.provider,
                set: tokens
            }).returning();
    let row = rows[0] as AccessToken

    return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token
    }
}


export async function callApi<T>(
    env: Env,
    provider: AuthProvider,
    providerHost: string,
    suffix: string,
    apiCall: (url: string, token: string) => Promise<T>): Promise<T> {
    if (!gTokenPairsMap?.get(provider)?.accessToken) {
        console.log(`get new access token...`)
        gTokenPairsMap.set(provider, await getAccessToken(
            provider, env))
    }

    try {
        let resp = await apiCall(`${providerHost}${suffix}`, gTokenPairsMap.get(provider)!.accessToken!)
        let jresp = JSON.stringify(resp)
        //console.log(`callApi: ${jresp}`)
        if (jresp.includes('UNAUTHENTICATED')) {
            throw new Error(`UNAUTHENTICATED: ${jresp}`)
        }
        // different auth providers have different error response formats.
        return resp;
    } catch (e) {
        console.log(`callApi failed: ${e}, try to refresh token and retry. It could still fail and you might need to re-oauth to ask more permissions.`)
        if (gTokenPairsMap?.get(provider)?.refreshToken) {
            console.log(`refresh token...`)
            gTokenPairsMap.set(provider, await refreshAccessToken(
                provider, env,
                gTokenPairsMap.get(provider)!.refreshToken!,
            ));

            return await apiCall(`${providerHost}${suffix}`, gTokenPairsMap.get(provider)!.accessToken!)
        }
        throw e;
    }
}