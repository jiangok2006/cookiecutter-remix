import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";
dotenv.config();

export default {
    schema: "./schema/*",
    out: "./migrations",
    driver: 'd1',
    dbCredentials: {
        wranglerConfigPath: 'wrangler.config.ts',
        dbName: 'test1'
    }
} satisfies Config;