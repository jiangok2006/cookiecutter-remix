import { Authenticator } from "remix-auth";
import { EmailLinkStrategy } from 'remix-auth-email-link';
import { getUserByEmail } from '~/models/user.server';
import type { User } from "~/schema/user";
import { createCookieSessionStorageWithVars } from "~/services/session.server";
import { verifyEmailAddress } from '~/services/verifier.server';
import { sendEmail } from "./email.service";

let authenticator: Authenticator<User>;

export const auth = (
    db: D1Database,
    magic_link_secret: string,
    cookie_secret: string) => {
    if (authenticator === undefined) {
        console.log(`auth: creating new authenticator`);
        authenticator = new Authenticator<User>(createCookieSessionStorageWithVars(cookie_secret));
        // Here we need the sendEmail, the secret and the URL where the user is sent
        // after clicking on the magic link
        authenticator.use(
            new EmailLinkStrategy(
                { verifyEmailAddress, sendEmail, secret: magic_link_secret, callbackURL: '/magic' },
                // In the verify callback,
                // you will receive the email address, form data and whether or not this is being called after clicking on magic link
                // and you should return the user instance
                async ({ email }: { email: string }) => {
                    console.log(`verify callback: email: ${email}`);
                    let user = await getUserByEmail(db, email);
                    return user;
                }
            )
        );
    }
    return authenticator;
}

