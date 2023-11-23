import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export interface Env {
    DB: D1Database;
    ENV: string;
}

export function getDb(context: AppLoadContext) {
    let env = context.env as Env;
    return drizzle(env.DB);
};
