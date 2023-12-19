import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users, type User } from "../schema/user";

export const getUserByEmail = async (db: D1Database, email: string): Promise<User> => {
    const result = await drizzle(db).select().from(users).where(eq(users.email, email)).execute();
    console.log(`result: ${JSON.stringify(result)}`);
    return result[0] as User
}