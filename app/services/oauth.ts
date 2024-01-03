import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
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

export let getAccessToken = async (
    provider: AuthProvider, db: D1Database,
    providerHost: string,
    cj_user_name: string | null = null,
    cj_api_key: string | null = null,

): Promise<TokenPair> => {
    let filter = eq(access_tokens.provider, provider)
    let rows = await drizzle(db).select().from(access_tokens).where(filter).execute();
    if (rows.length == 0) {
        return recreateTokens(db, provider, providerHost,
            cj_user_name, cj_api_key);
    }

    let row = rows[0] as AccessToken
    return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token
    }
}

async function recreateTokens(
    db: D1Database,
    provider: AuthProvider, provider_host: string,
    cj_user_name: string | null = null,
    cj_api_key: string | null = null): Promise<TokenPair> {
    switch (provider) {
        case AuthProvider.cj:
            return await recreateCJTokens(db, provider_host, cj_user_name!, cj_api_key!);
        case AuthProvider.ebay:
            return await recreateEbayTokens(provider_host, "", "");
        case AuthProvider.google:
            return await recreateGoogleTokens(provider_host, "", "");
        default:
            throw new Error(`invalid auth provider: ${provider}`)
    }
}

async function recreateCJTokens(
    db: D1Database,
    cj_host: string, cj_user_name: string, cj_api_key: string):
    Promise<TokenPair> {
    let resp = await fetch(`${cj_host}v1/authentication/getAccessToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: cj_user_name,
            password: cj_api_key
        })
    })
        .then(response => response.json<CJAccessTokenAPIResponse>())

    if (!resp.success) {
        throw new Error(`failed to get access token: ${resp.message}`)
    }

    const token = {
        provider: AuthProvider.cj,
        access_token: resp.data.accessToken,
        access_token_expires_at: new Date(resp.data.accessTokenExpiryDate),
        refresh_token: resp.data.refreshToken,
        refresh_token_expires_at: new Date(resp.data.refreshTokenExpiryDate),
    }

    let rows = await drizzle(db).insert(access_tokens).values(token)
        .onConflictDoUpdate(
            {
                target: access_tokens.provider,
                set: token
            }).returning();
    let row = rows[0] as AccessToken
    return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token
    }
}

async function recreateEbayTokens(
    cj_host: string, cj_user_name: string, cj_api_key: string):
    Promise<TokenPair> {
    throw new Error("not implemented");
}

async function recreateGoogleTokens(
    cj_host: string, cj_user_name: string, cj_api_key: string):
    Promise<TokenPair> {
    throw new Error("not implemented");
}


export let refreshAccessToken = async (
    db: D1Database,
    provider: AuthProvider, providerHost: string,
    refreshToken: string, cj_user_name: string, cj_api_key: string
): Promise<TokenPair> => {
    try {
        switch (provider) {
            case AuthProvider.cj:
                return await refreshCJTokens(
                    db, AuthProvider.cj, providerHost, refreshToken);
            case AuthProvider.ebay:
                return await refreshBayTokens(db, AuthProvider.cj, providerHost, refreshToken);
            case AuthProvider.google:
                return await refreshGoogleTokens(db, AuthProvider.cj, providerHost, refreshToken);
        }
    } catch (e) {
        console.error(`callApi failed: ${e}`)

        // if refresh token stop working
        return await recreateTokens(
            db, provider, providerHost,
            cj_user_name, cj_api_key);
    }
}


async function refreshCJTokens(
    db: D1Database, provider: AuthProvider,
    cj_host: string, refreshToken: string): Promise<TokenPair> {

    let resp = await fetch(`${cj_host}v1/authentication/refreshAccessToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refreshToken: refreshToken
        })
    })
        .then(response => response.json<CJAccessTokenAPIResponse>())

    return await saveToDb(db, provider, resp.data.accessToken,
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