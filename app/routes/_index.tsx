import { json, type ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
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
    data: {
        pageNum: number,
        pageSize: number,
        total: number,
        list: [{
            pid: string,
            productName: string,
            productNameEn: string,
            productSku: string,
            productImage: string,
            productWeight: string,
            productType: string,
            productUnit: string,
            categoryName: string,
            listingCount: number,
            sellPrice: string,
            remark: string,
            addMarkStatus: string,
            createTime: string,
            isVideo: string,
            saleStatus: number,
            listedNum: number,
            supplierName: string,
            supplierId: string,
            categoryId: string,
            sourceFrom: string,
            shippingCountryCodes: [string]
        }]
    }
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

    if (map.has("categoryRadio")) {
        if (map.get("categoryRadio") === "all") {
            ret = createQueryParams(ret, ``);
        } else {
            ret = createQueryParams(ret, `categoryId=${map.get("categoryRadio")}`);
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

function BuildCategoryComponent(categories: CategoryItem[]) {
    const [collapse, setCollapse] = useState(new Map<string, boolean>());

    if (!categories) {
        return null;
    }

    function toggle(id: string) {
        return () => {
            let newCollapse = new Map<string, boolean>(collapse);
            newCollapse.set(id, !newCollapse.get(id));
            setCollapse(newCollapse);

        }
    }

    let i = 0;
    let radios = Array.isArray(categories) ? categories.map((category: CategoryItem) => {
        let bg = (i % 2 == 0) ? "form-check bg-slate-100 p-3" : "form-check bg-slate-200 p-3"
        i++;
        return (
            <div key={category.categoryFirstId} >
                <div className={bg} key={category.categoryFirstId} onClick={toggle(category.categoryFirstId)}>
                    {category.categoryFirstName}
                </div>
                <div key={category.categoryFirstId}>
                    {category.categoryFirstList && collapse.get(category.categoryFirstId) && (
                        (
                            <div className="ml-4" >
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
                            </div>)
                    )}
                </div>
            </div>
        )
    }) : null;
    return radios?.concat(<div><input type="radio" name="categoryRadio" key="all" value="all" />all</div>);
}

function BuildProductTable(products: CJAPIProductListResponse) {
    if (!products || !products.data) {
        return null;
    }

    function showDetail() {

    }

    let table = Array.isArray(products.data.list) ? (
        <>
            <thead>
                <tr>
                    <th>Product Image</th>
                    <th>Product Name</th>
                    <th>Sell Price</th>
                    <th>Shipping Country Codes</th>
                    <th>Listing count</th>
                </tr>
            </thead>
            <tbody>
                {products.data.list.map((product: any, index: number) => {
                    let cjUrl = `https://cjdropshipping.com/product/${product.productNameEn.toLowerCase().replace(' ', '-')}-p-${product.pid}.html`;
                    let bg = index % 2 === 0 ? "bg-slate-100 p-3" : "bg-slate-200 p-3";
                    return (
                        <tr key={product.productId}>
                            <td className={bg}>
                                <a href="#" onClick={() => window.open(cjUrl, '_blank')}>
                                    <img src={product.productImage} width={300} alt={product.productNameEn} />
                                </a>
                            </td>
                            <td className={bg}>{product.productNameEn}</td>
                            <td className={bg}>{product.sellPrice}</td>
                            <td className={bg}>{product.shippingCountryCodes}</td>
                            <td className={bg}>{product.listedNum}</td>
                        </tr>
                    );
                })}
            </tbody>
        </>
    ) : null;
    return table;
}

export default function ProductList() {
    let { categories, products } = useLoaderData<typeof loader>();

    return (
        <div>
            <Form method="post">
                <div style={{ marginBottom: '1rem' }}>
                    {BuildCategoryComponent(categories.data)}
                    <br />
                    <div>
                        <label htmlFor="product_id">Product ID:</label>
                        <input type="text" name="product_id" key="product_id" className="bg-gray-100" />

                        &nbsp;&nbsp;
                        <label htmlFor="product_sku">Product SKU:</label>
                        <input type="text" name="product_sku" key="product_sku" className="bg-gray-100" />
                    </div>
                    <br />

                    <div>
                        <label htmlFor="warehouse_country_code">Warehouse:</label>
                        <select defaultValue="US" name="warehouse_country_code" className="bg-gray-100" >
                            <option value="US" key="US">US</option>
                            <option value="CN" key="CN">CN</option>
                        </select>

                        &nbsp;&nbsp;
                        <label htmlFor="create_time_from">CreateTimeFrom:</label>
                        <select defaultValue="all" key="create_time_from" name="create_time_from" className="bg-gray-100" >
                            <option value="all" key="all" >all</option>
                            <option value="in_7_days" key="in_7_days">in 7 days</option>
                            <option value="in_30_days" key="in_30_days">in 30 days</option>
                            <option value="in_90_days" key="in_90_days">in 90 days</option>
                        </select>
                    </div>

                    <br />
                    <div>
                        <label htmlFor="product_type">ProductType:</label>
                        <select defaultValue="all" key="product_type" name="product_type" className="bg-gray-100" >
                            <option value="all" key="all" >all</option>
                            <option value="SUPPLIER_SHIPPED_PRODUCT" key="SUPPLIER_SHIPPED_PRODUCT">SUPPLIER SHIPPED PRODUCT</option>
                            <option value="ORDINARY_PRODUCT" key="ORDINARY_PRODUCT">ORDINARY PRODUCT</option>
                        </select>

                        &nbsp;&nbsp;
                        <label htmlFor="min_price">Min Price:</label>
                        <input type="text" name="min_price" key="min_price" className="bg-gray-100" />

                        &nbsp;&nbsp;
                        <label htmlFor="max_price">Max Price:</label>
                        <input type="text" name="max_price" key="max_price" className="bg-gray-100" />

                        &nbsp;&nbsp;
                        <label htmlFor="page_num">page Num:</label>
                        <input type="text" name="page_num" key="page_num" className="bg-gray-100" />
                    </div>
                </div>
                <button type="submit" className="bg-gray-300 p-3" >search</button>
            </Form>
            {BuildProductTable(products)}
            <Outlet />
        </div>
    );
}