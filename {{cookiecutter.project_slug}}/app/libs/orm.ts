import { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { customers } from "../../schema/customers";

export interface Env {
    DB: D1Database;
}

export function getDb(context: AppLoadContext) {
    let env = context.env as Env;
    return drizzle(env.DB);
};

export type Customer = typeof customers.$inferSelect; // return type when queried
export type NewCustomer = typeof customers.$inferInsert; // insert type