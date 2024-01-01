import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createHash } from "crypto";
import type { Env } from "../libs/orm";


// https://developer.ebay.com/marketplace-account-deletion
export let loader: LoaderFunction = async ({ params, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    let { challengeCode } = params;
    const hash = createHash('sha256');
    hash.update(challengeCode!);
    hash.update(env.ebay_verification_token);
    hash.update(env.ebay_notification_endpoint);
    const responseHash = hash.digest('hex');
    console.log(Buffer.from(responseHash).toString());

    return new Response(responseHash, {
        headers: {
            'Content-Type': 'application/json',
        },
        status: 200,
    });
};