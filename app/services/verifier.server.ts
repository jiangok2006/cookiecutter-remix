// app/services/verifier.server.ts
import type { VerifyEmailFunction } from 'remix-auth-email-link';
import { email, parse, string } from 'valibot';

export let verifyEmailAddress: VerifyEmailFunction = async (emailToVerify) => {
    const EmailSchema = string([email()]);
    parse(EmailSchema, emailToVerify);
}