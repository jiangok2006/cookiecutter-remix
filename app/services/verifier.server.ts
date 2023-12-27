// app/services/verifier.server.ts
import type { VerifyEmailFunction } from 'remix-auth-email-link';
import { email, parse, string } from 'valibot';

export let verifyEmailAddress: VerifyEmailFunction = async (emailToVerify) => {
    console.log(`verifier.server.ts, verifyEmailAddress: ${emailToVerify}`);
    try {
        const EmailSchema = string([email()]);
        let parsed = parse(EmailSchema, emailToVerify);
        console.log(`verifier.server.ts, parsed: ${parsed}`);
    }
    catch (e) {
        console.error(`verifier.server.ts failed`, e);
        throw e;
    }
}