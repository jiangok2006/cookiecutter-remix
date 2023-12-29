

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";


export const cj_tokens = sqliteTable('cj_tokens', {
    id: integer('id').primaryKey(),
    access_token: text('access_token').notNull(),
    access_token_expires_at: integer('access_token_expires_at', { mode: 'timestamp_ms' }).notNull(),
    refresh_token: text('refresh_token').notNull(),
    refresh_token_expires_at: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }).notNull(),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type CJToken = typeof cj_tokens.$inferSelect
export type InsertCJToken = typeof cj_tokens.$inferInsert

export const insertCJTokenSchema = createInsertSchema(cj_tokens)
export const selectCJTokeSchema = createSelectSchema(cj_tokens);