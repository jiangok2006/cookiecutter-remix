import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import type { InsertUser } from "~/schema/user";
import { users } from "~/schema/user";
import { createDatabaseSessionStorage } from "~/services/session.server";


export const auth = (db: D1Database) => {
    const au = new Authenticator<InsertUser>(createDatabaseSessionStorage(db));
    au.use(
        new FormStrategy(async ({ form, context }) => {
            let email = form.get("email")?.toString();
            let password = form.get("password")?.toString();
            let user = await drizzle(db).select().from(users).where(and(eq(users.email, email!), eq(users.password, password!))).execute()
            if (user.length == 1)
                return user[0]
            return {}
        })
    );
    return au;
}
