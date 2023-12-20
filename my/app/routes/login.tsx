// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { auth } from '~/services/auth.server';
import { cookieSessionStorage } from '~/services/session.server';
import type { Env } from '../libs/orm';

export let loader = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`loader request: ${request.json()}, 
    cookie: ${request.headers.get('Cookie')},
    method: ${request.method}`)

    let env = context.env as Env;
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret,
        env.domain).isAuthenticated(request, { successRedirect: '/me' })

    // let { getSession } = await createDatabaseSessionStorage(
    //     env.DB, env.cookie_secret, env.domain)

    let session = await cookieSessionStorage.getSession(request.headers.get('Cookie'))
    // This session key `auth:magiclink` is the default one used by the EmailLinkStrategy
    // you can customize it passing a `sessionMagicLinkKey` when creating an
    // instance.
    return json({
        magicLinkSent: session.has('auth:magiclink'),
        magicLinkEmail: session.get('auth:email'),
    })
}

export let action = async ({ context, request }: ActionFunctionArgs) => {
    let env = context.env as Env;

    // The success redirect is required in this action, this is where the user is
    // going to be redirected after the magic link is sent, note that here the
    // user is not yet authenticated, so you can't send it to a private page.
    console.log(`action request: ${request}`)
    console.log(`header: ${JSON.stringify(request.headers)},
        method: ${request.method}`)
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret,
        env.domain)
        .authenticate('email-link', request, {
            successRedirect: '/login',
            // If this is not set, any error will be throw and the ErrorBoundary will be
            // rendered.
            failureRedirect: '/login',
        })
}

// app/routes/login.tsx
export default function Login() {
    let { magicLinkSent, magicLinkEmail } = useLoaderData<typeof loader>()

    return (
        <Form action="/login" method="post" data-static-form-name="magic_link">
            {magicLinkSent ? (
                <p>
                    Successfully sent magic link{' '}
                    {magicLinkEmail ? `to ${magicLinkEmail}` : ''}
                </p>
            ) : (
                <>
                    <h1>Log in to your account.</h1>
                    <div>
                        <label htmlFor="email">Email address</label>
                        <input id="email" type="email" name="email" required />
                    </div>
                    <button>Email a login link</button>
                </>
            )}
        </Form>
    )
}