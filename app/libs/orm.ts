import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export interface Env {
    DB: D1Database;
    ENV: string;
    cj_host: string;
    cj_user_name: string;
    cj_api_key: string;
    cookie_secret: string;
    magic_link_secret: string;
    user_white_list: string;
    disable_auth: string;
    ebay_verification_token: string;
    ebay_notification_endpoint: string;
    ebay_consent_api_state: string;
    ebay_host: string;
    ebay_auth_host: string;
    ebay_client_id: string;
    ebay_client_secret: string;
    ebay_redirect_uri: string;
    ebay_scope: string;
    google_api_key: string;
    google_client_id: string;
    google_redirect_uri: string;
    google_consent_api_state: string;
}

export function getDb(context: AppLoadContext) {
    let env = context.env as Env;
    return drizzle(env.DB);
}
