import { type ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { getCJAccessToken } from "../services/cj";

export type CJProductListAPIResponse = {
    code: number,
    message: string,
    success: boolean,
    data: {
    }
}

let formData: {
    [k: string]: FormDataEntryValue;
} | undefined = undefined;

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    let catId = ""
    if (formData != undefined) {
        catId = `?categoryId=${formData.category_id}`
        console.log(`catId: ${catId}`)
    }

    let token = await getCJAccessToken(env.DB, env.cj_host, env.cj_user_name, env.cj_api_key)
    console.log("loader called!");
    let res = await fetch(`${env.cj_host}v1/product/list${catId}`, {
        headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': token,
        },
    })
        .then(response => response.json<CJProductListAPIResponse>())

    return res;
};


export let action = async ({ request, context }: ActionFunctionArgs) => {
    let env = context.env as Env;
    console.log("action called!");

    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .authenticate('email-link', request,
                {
                    successRedirect: '/login',
                    failureRedirect: '/login',
                }
            )
    }

    const rawFormData = await request.formData();
    for (var key of rawFormData.keys()) {
        console.log(`key: ${key}`);
    }
    formData = Object.fromEntries(rawFormData);
    return null;
}


export default function ProductList() {
    let data = useLoaderData();
    return (
        <div>
            <Form method="post">
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="category_id">Category ID:</label>
                    <input type="text" name="category_id" id="category_id" placeholder="category_id" />
                    <label htmlFor="product_id">Product ID:</label>
                    <input type="text" name="product_id" id="product_id" placeholder="product_id" />
                    <label htmlFor="product_sku">Product SKU:</label>
                    <input type="text" name="product_sku" id="product_sku" placeholder="product_sku" />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="product_name">Product Name:</label>
                    <input type="text" name="product_name" id="product_name" placeholder="Product Name" />
                    <label htmlFor="product_type">Product Type:</label>
                    <input type="text" name="product_type" id="product_type" placeholder="Product Type" />
                    <label htmlFor="country_code">Country Code:</label>
                    <input type="text" name="country_code" id="country_code" placeholder="Country Code" />
                    <label htmlFor="brand_id">Brand ID:</label>
                    <input type="text" name="brand_id" id="brand_id" placeholder="Brand ID" />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="createtime_from">Create Time From:</label>
                    <input type="text" name="createtime_from" id="createtime_from" placeholder="Create Time From" />
                    <label htmlFor="createtime_to">Create Time To:</label>
                    <input type="text" name="createtime_to" id="createtime_to" placeholder="Create Time To" />
                    <label htmlFor="min_price">Min Price:</label>
                    <input type="text" name="min_price" id="min_price" placeholder="Min Price" />
                    <label htmlFor="max_price">Max Price:</label>
                    <input type="text" name="max_price" id="max_price" placeholder="Max Price" />
                </div>
                <button type="submit">search</button>
            </Form>
            <div id="results">
                filteredResults: {JSON.stringify(data, null, 2)}
            </div>
        </div>
    );
}