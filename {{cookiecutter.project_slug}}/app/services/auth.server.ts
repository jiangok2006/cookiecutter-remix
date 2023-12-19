import { Authenticator } from "remix-auth";
import { EmailLinkStrategy } from 'remix-auth-email-link';
import { getUserByEmail } from '~/models/user.server';
import type { InsertUser } from "~/schema/user";
import { createDatabaseSessionStorage } from "~/services/session.server";
import { verifyEmailAddress } from '~/services/verifier.server';
import { sendEmail } from "./email.service";

export const auth = (db: D1Database) => {
    let secret = process.env.MAGIC_LINK_SECRET
    if (!secret) throw new Error('Missing MAGIC_LINK_SECRET env variable.')

    const au = new Authenticator<InsertUser>(createDatabaseSessionStorage(db));
    // Here we need the sendEmail, the secret and the URL where the user is sent
    // after clicking on the magic link
    au.use(
        new EmailLinkStrategy(
            { verifyEmailAddress, sendEmail, secret, callbackURL: '/magic' },
            // In the verify callback,
            // you will receive the email address, form data and whether or not this is being called after clicking on magic link
            // and you should return the user instance
            async ({
                email,
                form,
                magicLinkVerify,
            }: {
                email: string
                form: FormData
                magicLinkVerify: boolean
            }) => {
                let user = await getUserByEmail(db, email)
                return user
            }
        )
    )
    return au;
}

