import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../libs/orm";
import { gTokenPairsMap } from "../routes/authed.cj._index";
import type { AccessToken } from "../schema/access_token";
import { access_tokens } from "../schema/access_token";
import { AuthProvider } from "./auth.server";

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

async function refreshBayTokens(
    db: D1Database, provider: AuthProvider,
    cj_host: string, refreshToken: string
): Promise<TokenPair> {
    throw new Error("not implemented")
}

async function refreshGoogleTokens(
    db: D1Database, provider: AuthProvider,
    cj_host: string, refreshToken: string
): Promise<TokenPair> {
    throw new Error("not implemented")
}

async function saveToDb(
    db: D1Database, provider: AuthProvider,
    accessToken: string, accessTokenExpiryDate: string,
    refreshToken: string, refreshTokenExpiryDate: string): Promise<TokenPair> {
    let rows = await drizzle(db).insert(access_tokens).values(
        {
            provider: provider,
            access_token: accessToken,
            access_token_expires_at: new Date(accessTokenExpiryDate),
            refresh_token: refreshToken,
            refresh_token_expires_at: new Date(refreshTokenExpiryDate),
        }
    ).returning();
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
        console.log(`callApi: ${jresp}`)
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