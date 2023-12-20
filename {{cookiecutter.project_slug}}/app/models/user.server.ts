import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users, type User } from "../schema/user";

export const getUserByEmail = async (db: D1Database, email: string): Promise<User> => {
    let result = await drizzle(db).select().from(users).where(eq(users.email, email)).execute();
    if (result.length === 0) {
        // to optimize, we could use a single query to insert and select
        result = await drizzle(db).insert(users).values({ email: email }).returning();
        // result = await drizzle(db).select().from(users).where(eq(users.email, email)).execute();
    }
    console.log(`getUserByEmail result: ${JSON.stringify(result)}`);
    return result[0] as User
}