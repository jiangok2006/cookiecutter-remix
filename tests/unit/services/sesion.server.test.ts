import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import type { InsertSession } from '../../../app/schema/session';
import { sessions } from '../../../app/schema/session';
import type { TestContextWithDB } from '../../common/setup';

describe("createDatabaseSessionStorage", () => {
    it("should save a session", async (ctx: TestContextWithDB) => {
        const session: InsertSession = {
            uuid: uuidv4(),
            user_id: 1,
            expires_at: new Date(),
            data: { user_name: 'me' }
        }
        await ctx.db.insert(sessions).values(session);
        const rows = await ctx.db.select().from(sessions).all()
        expect(rows.length).toEqual(1);
        expect(rows[0].uuid).toEqual(session.uuid);
    });
});