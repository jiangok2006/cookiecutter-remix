import { describe, expect, it } from 'vitest';
import { customers } from '../../../../schema/customers';
import { MyTestContext, newCustomer } from '../../../common/setup';

describe("Path Loader", () => {
  it("should return a response", async (ctx: MyTestContext) => {
    await ctx.db.insert(customers).values(newCustomer).execute;
    const rows = await ctx.db.select().from(customers).all
    expect(rows.length).toEqual(1);
  });
});