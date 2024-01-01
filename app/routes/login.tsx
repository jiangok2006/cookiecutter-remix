import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { createCookieSessionStorageWithVars } from "../services/session.server";

export let loader = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (env.disable_auth === 'true')
        return json({ magicLinkSent: false, magicLinkEmail: '' })

    console.log(`login loader request.headers.get('Cookie'): ${request.headers.get('Cookie')}`)

    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret)
        .isAuthenticated(request, { successRedirect: '/authed/cj' })

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

export let action = async ({ request, context }: ActionFunctionArgs) => {
    let env = context.env as Env;

    if (env.disable_auth === 'true')
        return json({})

    // The success redirect is required in this action, this is where the user is
    // going to be redirected after the magic link is sent, note that here the
    // user is not yet authenticated, so you can't send it to a private page.
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

export default function Login() {
    let { magicLinkSent, magicLinkEmail } = useLoaderData<typeof loader>()
    return (
        <Form method="post">
            <div className="bg-blue-100 grid place-items-center h-screen">

                {magicLinkSent ? (
                    <p>
                        Successfully sent magic link{' '}
                        {magicLinkEmail ? `to ${magicLinkEmail}` : ''}
                    </p>
                ) : (
                    <>

                        <div className="bg-gradient-to-b from-indigo-500 h-1/2 w-1/3 rounded p-5 font-serif " >
                            <div className='pt-5 pb-5 grid place-items-center '>
                                MyCoolApp
                            </div>

                            <div className='pb-5 pt-5'>
                                Log in to your account:
                            </div>
                            <div className='pb-5 pt-5'>
                                <label htmlFor="email" className='pr-3'>Email address:</label>
                                <input id="email" type="email" name="email" className='bg-slate-200' required />
                            </div>
                            <div className='pb-5 pt-5'>
                                <button type='submit' className='bg-slate-300 p-5'>Email a login link</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Form>
    )
}