import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { string, uuid } from "valibot";


export const sessions = sqliteTable('sessions', {
    uuid: text('uuid').primaryKey(),
    user_id: integer('user_id').notNull(),
    data: text('data', { mode: 'json' }),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    expires_at: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
});

export type Session = typeof sessions.$inferSelect
export type InsertSession = typeof sessions.$inferInsert

export const insertSessionSchema = createInsertSchema(sessions, {
    uuid: string([uuid()]),
});

export const selectSessionSchema = createSelectSchema(sessions);