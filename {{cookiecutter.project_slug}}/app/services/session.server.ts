
import type { SessionIdStorageStrategy } from "@remix-run/cloudflare";
import { createSessionStorage } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from 'uuid';
import { parse } from "valibot";
import type { InsertSession } from "../schema/session";
import { insertSessionSchema, sessions } from "../schema/session";

export type SessionData = {
    userId: string;
};

export type SessionFlashData = {
    error: string;
};

export function createDatabaseSessionStorage<SessionData>(
    db: D1Database
) {
    const strategy: SessionIdStorageStrategy =
    {
        cookie: {
            name: "__session",
            domain: "127.0.0.1",
            httpOnly: true,
            maxAge: 3600,
            path: "/",
            sameSite: "lax",
            secrets: ["s3cret1"],
            secure: true,
        },
        async createData(data, expires) {
            console.log(`data: ${JSON.stringify(data)}`);
            if (!data.user.id)
                throw new Error(`cannot get user from db!`)
            const session: InsertSession = {
                uuid: uuidv4(),
                user_id: data.user.id,
                data: data,
                expires_at: expires!
            }
            const isSessionValid = parse(insertSessionSchema, session);
            if (!isSessionValid) {
                throw new Error(`Invalid session: ${JSON.stringify(session)}`);
            }

            const result = await drizzle(db)
                .insert(sessions)
                .values(session).returning()
            console.log(`result: ${JSON.stringify(result)}`);
            return result[0].uuid;
        },

        async readData(id) {
            if (!id) {
                return null;
            }
            const result = await drizzle(db).select({ data: sessions.data }).from(sessions).where(eq(sessions.uuid, id)).execute();
            console.log(`result: ${JSON.stringify(result)}`);
            return result[0].data as SessionData & { [x: `__flash_${string}__`]: any; }
        },

        async updateData(id, data, expires) {
            console.log(`updateData: id: ${id}`);

            const session = {
                uuid: id,
                user_id: data.user.id,
                data: null,
                expires_at: expires!
            }
            const isSessionValid = parse(insertSessionSchema, session);
            if (isSessionValid) {
                await drizzle(db).update(sessions).set(session).where(eq(sessions.uuid, id));
            }
        },

        async deleteData(id) {
            await drizzle(db).delete(sessions).where(eq(sessions.uuid, id));
        },
    }
    return createSessionStorage(strategy);
}
