import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { Environment } from "../libs/types";
import { auth } from "../services/auth.server";


export default function Screen() {
    return (
        <Form method="post"  >
            <input type="email" name="email" required />
            <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
            />
            <p>
                <button type="submit" name="_action" value="signup" >Sign Up</button>
                <button type="submit" name="_action" value="signin">Sign In</button>
            </p>
        </Form>
    );
}

export async function action({ context, request }: ActionFunctionArgs) {
    let env = context.env as Env;
    if (env.ENV === Environment.Production) {
        throw new Error("Coming soon");
    }

    await auth(env.DB).authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
    let env = context.env as Env;

    return await auth(env.DB).isAuthenticated(request, {
        successRedirect: "/",
    });
    return null;
}