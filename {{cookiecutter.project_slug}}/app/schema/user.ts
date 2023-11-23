import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { email, minLength, minValue, number, string } from "valibot";


export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').unique(),
    password: text('password'),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    is_test: integer('is_test', { mode: 'boolean' }).default(false).notNull()
});

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

export const insertUserSchema = createInsertSchema(users, {
    id: number([minValue(0)]),
    email: string([email()]),
    password: string([minLength(8)]),
});

export const selectUserSchema = createSelectSchema(users);

