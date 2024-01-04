import { json, type ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { Env } from "../libs/orm";
import { AuthProvider, auth } from "../services/auth.server";
import { callApi, type TokenPair } from "../services/oauth";

const gProvider = AuthProvider.cj

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



export let gTokenPairsMap = new Map<AuthProvider, TokenPair | null>()


let gFormData: {
    [k: string]: FormDataEntryValue;
} | undefined = undefined;

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
    if (!gFormData) {
        return ""
    }
    const map = new Map<string, string>();
    for (const [key, value] of Object.entries(gFormData)) {
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

    if (map.has("min_price"))
        ret = createQueryParams(ret, `minPrice=${map.get("min_price")}`);

    if (map.has("max_price"))
        ret = createQueryParams(ret, `maxPrice=${map.get("max_price")}`);

    if (map.has("warehouse_country_code")) {
        if (map.get("warehouse_country_code") === "all") {
            ret = createQueryParams(ret, ``);
        } else {
            ret = createQueryParams(ret, `countryCode=${map.get("warehouse_country_code")}`);
        }
    }

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

    if (map.has("page_size"))
        ret = createQueryParams(ret, `pageSize=${map.get("page_size")}`);

    console.log(`formToParams: ${ret}`);
    return ret;
}

async function call<T>(url: string, token: string): Promise<T> {
    return await fetch(url, BuildCJHeader(token))
        .then(response => response.json<T>())
}

function BuildCJHeader(token: string) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': token,
        },
    }
}

async function getCategories(env: Env): Promise<CJAPICategoryResponse> {
    return await callApi<CJAPICategoryResponse>(
        env, gProvider, env.cj_host, `v1/product/getCategory`, call<CJAPICategoryResponse>);
}

async function getProducts(env: Env, suffix: string) {
    return await callApi<CJAPIProductListResponse>(
        env, gProvider, env.cj_host, `v1/product/list${suffix}`, call<CJAPIProductListResponse>);
}

export let loader: LoaderFunction = async ({ request, context }: LoaderFunctionArgs) => {
    let env = context.env as Env;

    if (env.disable_auth === 'false') {
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
    if (env.disable_auth === 'false') {
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
    gFormData = Object.fromEntries(rawFormData);
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

    let radios = Array.isArray(categories) ? categories.map((category: CategoryItem, index: number) => {
        let bg = (index % 2 == 0) ? "form-check bg-slate-100 p-3" : "form-check bg-slate-200 p-3"
        return (
            <div key={`${category.categoryFirstId}_${index}`} >
                <div className={bg} key={'_' + category.categoryFirstId} onClick={toggle(category.categoryFirstId)}>
                    {category.categoryFirstName}
                </div>
                <div key={'__' + category.categoryFirstId}>
                    {category.categoryFirstList && collapse.get(category.categoryFirstId) && (
                        (
                            <div className="ml-4" >
                                {category.categoryFirstList && category.categoryFirstList.map((firstCategory: CategoryFirstListItem, index: number) => (
                                    <div className="form-check" key={`${firstCategory.categorySecondId}_${index}`}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;{firstCategory.categorySecondName}
                                        <span>
                                            {firstCategory.categorySecondList && firstCategory.categorySecondList.map((secondCategory: CategorySecondListItem, index: number) => (
                                                <span key={`${secondCategory.categoryId}_${index}`}>
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
    return radios?.concat(<div key="all"><input type="radio" name="categoryRadio" key="all" value="all" />all</div>);
}

function BuildProductTable(products: CJAPIProductListResponse) {
    const [sortedField, setSortedField] = useState<string | null>(null);
    const [isAscending, setIsAscending] = useState(false);

    if (!products || !products.data) {
        return null;
    }

    let sortedProducts = [...products.data.list];
    if (sortedField !== null) {
        sortedProducts.sort((a, b) => {
            if (a[sortedField as keyof typeof a] < b[sortedField as keyof typeof b]) {
                return isAscending ? -1 : 1;
            }
            if (a[sortedField as keyof typeof a] > b[sortedField as keyof typeof b]) {
                return isAscending ? 1 : -1;
            }
            return 0;
        });
    }

    let table = (
        <>
            <pre>
                total (may include non-CN/US warehouses): {products.data.total}
            </pre>
            <table>
                <thead>
                    <tr>
                        <th>
                            Product Image
                        </th>
                        <th>
                            Product Name
                        </th>
                        <th>
                            Sell Price
                        </th>
                        <th>
                            Shipping Country Codes
                        </th>
                        <th>
                            <button type="button" onClick={() => {
                                setSortedField('listingCount');
                                setIsAscending(!isAscending)
                            }}>
                                Listing count
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts.map((product: any, index: number) => {
                        if (product.shippingCountryCodes.indexOf('CN') < 0 && product.shippingCountryCodes.indexOf('US') < 0) return null;
                        let cjUrl = `https://cjdropshipping.com/product/${product.productNameEn.toLowerCase().replace(' ', '-')}-p-${product.pid}.html`;
                        let bg = index % 2 === 0 ? "bg-slate-100 p-3" : "bg-slate-200 p-3";
                        return (
                            <tr key={`${product.productId}_${index}`}>
                                <td className={bg}>
                                    <a href="#" onClick={() => window.open(cjUrl, '_blank')}>
                                        <img src={product.productImage} width={300} alt={product.productNameEn} />
                                    </a>
                                </td>
                                <td className={bg} style={{ width: "20%" }}>{product.productNameEn}</td>
                                <td className={bg}>{product.sellPrice}</td>
                                <td className={bg}>{product.shippingCountryCodes.join(',')}</td>
                                <td className={bg}>{product.listedNum}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
    return table;
}

export default function ProductList() {
    let { categories, products } = useLoaderData<typeof loader>();

    return (
        <>
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

                    <div >
                        <label htmlFor="warehouse_country_code">Warehouse:</label>
                        <select defaultValue="all" name="warehouse_country_code" className="bg-gray-100" >
                            <option value="all" key="all">all</option>
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

                        &nbsp;&nbsp;
                        <label htmlFor="product_type">ProductType:</label>
                        <select defaultValue="all" key="product_type" name="product_type" className="bg-gray-100" >
                            <option value="all" key="all" >all</option>
                            <option value="ORDINARY_PRODUCT" key="ORDINARY_PRODUCT">ORDINARY PRODUCT</option>
                            <option value="SUPPLIER_SHIPPED_PRODUCT" key="SUPPLIER_SHIPPED_PRODUCT">SUPPLIER SHIPPED PRODUCT</option>
                        </select>

                        &nbsp;&nbsp;
                        <label htmlFor="min_price">Min Price:</label>
                        <input type="text" name="min_price" key="min_price" className="bg-gray-100" />

                        &nbsp;&nbsp;
                        <label htmlFor="max_price">Max Price:</label>
                        <input type="text" name="max_price" key="max_price" className="bg-gray-100" />
                    </div>

                    <br />
                    <div>
                        <label htmlFor="page_num">page Num:</label>
                        <input type="text" name="page_num" key="page_num" className="bg-gray-100" />

                        &nbsp;&nbsp;
                        <label htmlFor="page_size">page size (less than 200):</label>
                        <input type="text" name="page_size" key="page_size" className="bg-gray-100" />
                    </div>
                </div>
                <button type="submit" className="bg-gray-300 p-3" >search</button>
            </Form>
            {BuildProductTable(products)}
            <Outlet />
        </>
    );
}