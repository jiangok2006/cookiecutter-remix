// app/routes/me.tsx
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { auth } from '~/services/auth.server';
import type { Env } from '../libs/orm';

export let loader = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    // If the user is here, it's already authenticated, if not redirect them to
    // the login page.
    let user = await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .isAuthenticated(request, { failureRedirect: '/login' })
    return json({ user })
}

export default function Me() {
    let { user } = useLoaderData<typeof loader>()
    return (
        <div>
            <p>Welcome! You are logged in as {user.email}</p>
        </div>
    )
}