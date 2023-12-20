import { json, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";



export let loader: LoaderFunction = async ({ context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    const cj_host = env.cj_host;
    if (cj_host === undefined) {
        return Promise.reject(new Error('CJ_HOST is not defined!'));
    }

    const response = await fetch(cj_host, {
        method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
        return json(data);
    } else {
        return Promise.reject(new Error((data as any).message));
    }
};

export default function HelloCJ() {
    let data = useLoaderData();

    return (
        <div>
            <h1>Data from API:</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}