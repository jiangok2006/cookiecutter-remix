import type { LinksFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import type { Env } from "./libs/orm";
import { auth } from "./services/auth.server";
import appStylesHref from "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export let loader: LoaderFunction = async ({ params, request, context }: LoaderFunctionArgs) => {
  let env = context.env as Env;
  if (!env.disable_auth) {
    await auth(
      env.DB,
      env.magic_link_secret,
      env.cookie_secret)
      .isAuthenticated(request, { failureRedirect: '/login' })
  }

  return null;
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-row bg-stone-300">
          <span className="p-6">MyCoolApp</span>
          <Link to="/cj" className="p-6 bg-orange-300 hover:bg-orange-100">CJ</Link>
          <Link to="/ebay" className="p-6 bg-orange-300 hover:bg-orange-100">eBay</Link>
          <Link to="/google" className="p-6 bg-orange-300 hover:bg-orange-100">Google</Link>
        </div>
        <div className="p-5">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />

      </body>
    </html>
  );
}
