import Database from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { TestContext, beforeEach } from 'vitest';

export const httpUrl = process.env.APP_HTTP_URL

export const newCustomer = {
  id: "test"
}

export interface MyTestContext extends TestContext {
  db: BetterSQLite3Database<Record<string, never>>;
}

beforeEach(async (context: MyTestContext) => {
  const sqlite = new Database(':memory:');
  context.db = drizzle(sqlite);
})