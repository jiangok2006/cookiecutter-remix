import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";
dotenv.config();

export default {
    schema: "./schema/*",
    out: "./migrations",
    driver: 'd1',
} satisfies Config;