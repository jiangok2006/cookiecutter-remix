import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export interface Env {
    DB: D1Database;
    ENV: string;
    magic_link_secret: string;
    cj_host: string;
    cj_user_name: string;
    cj_api_key: string;
    cookie_secret: string;
    domain: string;
}

export function getDb(context: AppLoadContext) {
    let env = context.env as Env;
    return drizzle(env.DB);
}