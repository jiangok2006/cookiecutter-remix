import { json, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";

// cloudfare page read env vars from .dev.vars
export let loader: LoaderFunction = async ({ context }: LoaderFunctionArgs) => {
  let env = context.env as Env;
  const cj_host = env.cj_host;
  if (cj_host === undefined) {
    return Promise.reject(new Error('cj_host is not defined!'));
  }

  const cj_user_name = env.cj_user_name;
  if (cj_user_name === undefined) {
    return Promise.reject(new Error('cj_user_name is not defined!'));
  }

  const cj_api_key = env.cj_api_key;
  if (cj_api_key === undefined) {
    return Promise.reject(new Error('cj_api_key is not defined!'));
  }

  const response = await fetch(`${cj_host}v1/authentication/getAccessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: cj_user_name,
      password: cj_api_key
    })
  });

  const data = await response.json();

  if (response.ok) {
    return json(data);
  } else {
    return Promise.reject(new Error((data as any).message));
  }
};

export default function Index() {
  let data = useLoaderData();

  return (
    <div>
      <h1>Data from API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}