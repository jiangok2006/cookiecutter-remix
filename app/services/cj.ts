import { drizzle } from "drizzle-orm/d1";
import type { CJToken, InsertCJToken } from "../schema/cj_token";
import { cj_tokens } from "../schema/cj_token";

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

let shouldRefreshToken = (token: CJToken): boolean => {
    let now = new Date();
    let accessTokenExpireDate = new Date(token.access_token_expires_at);
    accessTokenExpireDate.setDate(accessTokenExpireDate.getDate() - 1);
    return now > accessTokenExpireDate;
}

export let getCJAccessToken = async (
    db: D1Database, cj_host: string, cj_user_name: string, cj_api_key: string
): Promise<string> => {
    let rows = await drizzle(db).select().from(cj_tokens).execute();
    if (rows.length > 0) {
        if (shouldRefreshToken(rows[0])) {
            let res = await refreshCJAccessToken(cj_host, rows[0].refresh_token);
            rows = await drizzle(db).insert(cj_tokens).values(
                {
                    access_token: res.data.accessToken,
                    access_token_expires_at: new Date(res.data.accessTokenExpiryDate),
                    refresh_token: res.data.refreshToken,
                    refresh_token_expires_at: new Date(res.data.refreshTokenExpiryDate),
                }
            ).returning();
        }
        return (rows[0] as CJToken).access_token;
    }

    let res = await fetch(`${cj_host}v1/authentication/getAccessToken`, {
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

    if (!res) throw new Error(`getCJAccessToken failed, res is null`);
    if (!res.success || !res.data) {
        throw new Error(`getCJAccessToken failed, res is ${JSON.stringify(res)}`)
    }

    console.log(`getCJAccessToken5, res: ${res.data}`);

    const token: InsertCJToken = {
        access_token: res.data.accessToken,
        access_token_expires_at: new Date(res.data.accessTokenExpiryDate),
        refresh_token: res.data.refreshToken,
        refresh_token_expires_at: new Date(res.data.refreshTokenExpiryDate),
    }

    rows = await drizzle(db).insert(cj_tokens).values(token).returning();
    console.log(`getCJAccessToken6`);

    return (rows[0] as CJToken).access_token;
}

export let refreshCJAccessToken = async (
    cj_host: string, refreshToken: string
): Promise<AccessTokenAPIResponse> => {
    return fetch(`${cj_host}v1/authentication/refreshAccessToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refreshToken: refreshToken
        })
    })
        .then(response => response.json<AccessTokenAPIResponse>())
}

