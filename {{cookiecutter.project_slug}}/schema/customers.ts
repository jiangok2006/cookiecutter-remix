import { sqliteTable, text } from "drizzle-orm/sqlite-core";


export const customers = sqliteTable('Customers', {
    id: text('id')
});