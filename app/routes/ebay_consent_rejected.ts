import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`consent is rejected. request.url: ${request.url}`);
    return `consent is rejected, ${await request.text()}`
};


