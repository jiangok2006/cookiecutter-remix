import { json, type ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import type { Env } from "../libs/orm";
import { auth } from "../services/auth.server";
import { getCJAccessToken } from "../services/cj";


type CategorySecondListItem = {
    categoryId: string,
    categoryName: string,
}

type CategoryFirstListItem = {
    categorySecondId: string,
    categorySecondName: string,
    categorySecondList: [CategorySecondListItem]
}

type CategoryItem = {
    categoryFirstId: string,
    categoryFirstName: string,
    categoryFirstList: [CategoryFirstListItem]
}

type CJAPICategoryResponse = {
    code: number,
    message: string,
    success: boolean,
    data: [CategoryItem]
}

type CJAPIProductListResponse = {
    code: number,
    message: string,
    success: boolean,
    data: {}
}

let formData: {
    [k: string]: FormDataEntryValue;
} | undefined = undefined;

let token: string = ""

function createQueryParams(ret: string, param: string) {
    console.log(`createQueryParams: ${ret}, ${param}`);
    ret = ret === "" ? `?` : param === "" ? ret : `${ret}&`
    return `${ret}${param}`
}

function createTimeString(days: number) {
    let options = { hour12: false };
    let date = Date.now() - days * 24 * 60 * 60 * 1000
    let ret = new Date(date).toLocaleString('en-US', options).replace(",", "");
    return encodeURIComponent(ret);
}

function formToParams(): string {
    if (!formData) {
        return ""
    }
    const map = new Map<string, string>();
    for (const [key, value] of Object.entries(formData)) {
        console.log(`${key}: ${value}`);
        if (value) {
            map.set(key, value.toString());
            console.log(`add to map: ${key}: ${value}`);
        }
    }
    if (map.has("product_id"))
        return `?pid=${map.get("product_id")}`;

    if (map.has("product_sku"))
        return `?productSku=${map.get("product_sku")}`;


    let ret: string = "";

    if (map.has("brand_id"))
        ret = createQueryParams(ret, `brandId=${map.get("brand_id")}`);

    if (map.has("country_code"))
        ret = createQueryParams(ret, `countryCode=${map.get("country_code")}`);

    if (map.has("min_price"))
        ret = createQueryParams(ret, `minPrice=${map.get("min_price")}`);

    if (map.has("max_price"))
        ret = createQueryParams(ret, `maxPrice=${map.get("max_price")}`);

    if (map.has("warehouse_country_code"))
        ret = createQueryParams(ret, `countryCode=${map.get("warehouse_country_code")}`);

    if (map.has("create_time_from")) {
        if (map.get("create_time_from") === "all") {
            ret = createQueryParams(ret, ``);
        }
        else if (map.get("create_time_from") === "in_7_days") {
            ret = createQueryParams(ret, `createTimeFrom=${createTimeString(7)}`);
        }
        else if (map.get("create_time_from") === "in_30_days") {
            ret = createQueryParams(ret, `createTimeFrom=${createTimeString(30)}`);
        }
        else if (map.get("create_time_from") === "in_90_days") {
            ret = createQueryParams(ret, `createTimeFrom=${createTimeString(90)}`);
        } else {
            throw new Error(`create_time_from: ${map.get("create_time_from")} is not supported`);
        }
    }

    if (map.has("product_type")) {
        if (map.get("product_type") === "all") {
            ret = createQueryParams(ret, ``);
        }
        else if (map.get("product_type") === "SUPPLIER_SHIPPED_PRODUCT") {
            ret = createQueryParams(ret, `productType=${map.get("product_type")}`);
        } else {
            throw new Error(`product_type: ${map.get("product_type")} is not supported`);
        }
    }

    if (map.has("page_num"))
        ret = createQueryParams(ret, `pageNum=${map.get("page_num")}`);

    console.log(`formToParams: ${ret}`);
    return ret;
}

async function callCJ<T>(env: Env, suffix: string) {
    if (!token)
        token = await getCJAccessToken(env.DB, env.cj_host, env.cj_user_name, env.cj_api_key)
    return await fetch(`${env.cj_host}v1/${suffix}`, {
        headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': token,
        },
    })
        .then(response => response.json<T>())
}

async function getCategories(env: Env) {
    return await callCJ<CJAPICategoryResponse>(env, "product/getCategory");
}

async function getProducts(env: Env, suffix: string) {
    return await callCJ<CJAPIProductListResponse>(env, "product/list" + suffix);
}

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;
    if (!env.disable_auth) {
        await auth(
            env.DB,
            env.magic_link_secret,
            env.cookie_secret)
            .isAuthenticated(request, { failureRedirect: '/login' })
    }

    return json({
        categories: await getCategories(env),
        products: await getProducts(env, formToParams()),
    });
};


export let action = async ({ request, context }: ActionFunctionArgs) => {
    let env = context.env as Env;
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
    formData = Object.fromEntries(rawFormData);
    return null;
}

function buildCategoryComponent(categories: CategoryItem[]) {
    if (!categories) {
        return null;
    }

    let radios = Array.isArray(categories) ? categories.map((category: CategoryItem) => (
        <div className="form-check" key={category.categoryFirstId}>
            {category.categoryFirstName}
            {category.categoryFirstList && (
                <div className="ml-4">
                    {category.categoryFirstList && category.categoryFirstList.map((firstCategory: CategoryFirstListItem) => (
                        <div className="form-check" key={firstCategory.categorySecondId}>
                            &nbsp;&nbsp;&nbsp;&nbsp;{firstCategory.categorySecondName}
                            <span>
                                {firstCategory.categorySecondList && firstCategory.categorySecondList.map((secondCategory: CategorySecondListItem) => (
                                    <span key={secondCategory.categoryId}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <input type="radio" name="categoryRadio" value={secondCategory.categoryId} />
                                        {secondCategory.categoryName}
                                    </span>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )) : null;
    return radios?.concat(<div><input type="radio" name="categoryRadio" key="all" value="all" />all</div>);
}


export default function ProductList() {
    let { categories, products } = useLoaderData<typeof loader>();

    return (
        <div>
            <Form method="post">
                <div style={{ marginBottom: '1rem' }}>
                    {buildCategoryComponent(categories.data)}
                    <br />
                    <div>
                        <label htmlFor="product_id">Product ID:</label>
                        <input type="text" name="product_id" key="product_id" />

                        &nbsp;&nbsp;
                        <label htmlFor="product_sku">Product SKU:</label>
                        <input type="text" name="product_sku" key="product_sku" />
                    </div>
                    <br />

                    <div>
                        &nbsp;&nbsp;
                        <label htmlFor="warehouse_country_code">Warehouse:</label>
                        <select defaultValue="US" name="warehouse_country_code">
                            <option value="US" key="US">US</option>
                            <option value="CN" key="CN">CN</option>
                        </select>

                        &nbsp;&nbsp;
                        <label htmlFor="create_time_from">CreateTimeFrom:</label>
                        <select defaultValue="all" key="create_time_from" name="create_time_from">
                            <option value="all" key="all" >all</option>
                            <option value="in_7_days" key="in_7_days">in 7 days</option>
                            <option value="in_30_days" key="in_30_days">in 30 days</option>
                            <option value="in_90_days" key="in_90_days">in 90 days</option>
                        </select>
                    </div>

                    <br />
                    <div>
                        &nbsp;&nbsp;
                        <label htmlFor="product_type">ProductType:</label>
                        <select defaultValue="all" key="product_type" name="product_type">
                            <option value="all" key="all" >all</option>
                            <option value="SUPPLIER_SHIPPED_PRODUCT" key="SUPPLIER_SHIPPED_PRODUCT">SUPPLIER SHIPPED PRODUCT</option>
                            <option value="ORDINARY_PRODUCT" key="ORDINARY_PRODUCT">ORDINARY PRODUCT</option>
                        </select>

                        &nbsp;&nbsp;
                        <label htmlFor="min_price">Min Price:</label>
                        <input type="text" name="min_price" key="min_price" />

                        &nbsp;&nbsp;
                        <label htmlFor="max_price">Max Price:</label>
                        <input type="text" name="max_price" key="max_price" />

                        &nbsp;&nbsp;
                        <label htmlFor="page_num">page Num:</label>
                        <input type="text" name="page_num" key="page_num" />
                    </div>
                </div>
                <button type="submit">search</button>
            </Form>
            <pre>
                {JSON.stringify(products, null, 2)}
            </pre>
        </div>
    );
}