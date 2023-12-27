// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { auth } from '~/services/auth.server';
import { createCookieSessionStorageWithVars } from '~/services/session.server';
import type { Env } from '../libs/orm';

export let loader = async ({ request, context }: LoaderFunctionArgs) => {
    console.log(`login loader request: cookie: ${request.headers.get('Cookie')}`)

    let env = context.env as Env;
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret).isAuthenticated(request, { successRedirect: '/me' })

    let session = await createCookieSessionStorageWithVars(env.cookie_secret)
        .getSession(request.headers.get('Cookie'))

    console.log(`login loader session: ${JSON.stringify(session)}`)
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
    //console.log(`login action request.text: ${await request.text()}`)
    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .authenticate('email-link', request,
            {
                successRedirect: '/login',
                // If this is not set, any error will be throw and the ErrorBoundary will be
                // rendered.
                failureRedirect: '/login',
            }
        )
}



// why this is not working?
// export const headers: HeadersFunction = ({
//     actionHeaders,
// }) => ({
//     "host2222": "localhost",
// });

// app/routes/login.tsx
export default function Login() {
    let { magicLinkSent, magicLinkEmail } = useLoaderData<typeof loader>()
    console.log(`login magicLinkSent: ${magicLinkSent}, magicLinkEmail: ${magicLinkEmail}`)
    return (
        <Form action="/login" method="post">
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