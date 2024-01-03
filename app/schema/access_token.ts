

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";


export const access_tokens = sqliteTable('access_tokens', {
    id: integer('id').primaryKey(),
    provider: text('provider').notNull().unique(), // cj, ebay, google
    access_token: text('access_token').notNull(),
    access_token_expires_at: integer('access_token_expires_at', { mode: 'timestamp_ms' }).notNull(),
    refresh_token: text('refresh_token').notNull(),
    refresh_token_expires_at: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }).notNull(),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type AccessToken = typeof access_tokens.$inferSelect
export type InsertAccessToken = typeof access_tokens.$inferInsert

export const insertAccessTokenSchema = createInsertSchema(access_tokens)
export const selectAccessTokeSchema = createSelectSchema(access_tokens);