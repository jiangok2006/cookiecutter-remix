import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { auth } from '~/services/auth.server';
import type { Env } from '../libs/orm';

export let loader = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;

    await auth(
        env.DB,
        env.magic_link_secret,
        env.cookie_secret).authenticate('email-link', request, {
            // If the user was authenticated, we redirect them to their profile page
            // This redirect is optional, if not defined the user will be returned by
            // the `authenticate` function and you can render something on this page
            // manually redirect the user.
            successRedirect: '/authed',
            // If something failed we take them back to the login page
            // This redirect is optional, if not defined any error will be throw and
            // the ErrorBoundary will be rendered.
            failureRedirect: '/login',
        })
}