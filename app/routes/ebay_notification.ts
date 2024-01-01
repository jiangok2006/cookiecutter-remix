import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createHash } from "crypto";
import type { Env } from "../libs/orm";


// https://developer.ebay.com/marketplace-account-deletion
export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`before env`);

    let env = context.env as Env;
    console.log(`after env: ${env.ebay_verification_token}`);

    const url = new URL(request.url);
    console.log(`get url: ${url}`);

    const challengeCode = url.searchParams.get("challenge_code");
    console.log(`get challengeCode: ${challengeCode}`);

    const hash = createHash('sha256');
    hash.update(challengeCode!);
    hash.update(env.ebay_verification_token);
    hash.update(env.ebay_notification_endpoint);
    const responseHash = hash.digest('hex');

    return new Response(responseHash, {
        headers: {
            'Content-Type': 'application/json',
        },
        status: 200,
    });
};