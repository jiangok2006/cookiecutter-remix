import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`consent is accepted. request.url: ${request.url}`);
    return `consent is accepted, ${await request.text()}`
};


