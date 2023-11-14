import { customers } from "../../schema/customers";

export interface Env {
    DB: D1Database;
}


export type Customer = typeof customers.$inferSelect; // return type when queried
export type NewCustomer = typeof customers.$inferInsert; // insert type