
export let getEbayAccessToken = async (
    ebay_host: string, ebay_client_id: string, ebay_redirect_uri: string,
    ebay_scope: string, ebay_consent_api_state: string
) => {
    return await askConsent(
        ebay_host, ebay_client_id, ebay_redirect_uri,
        ebay_scope, ebay_consent_api_state);
}


let askConsent = async (
    ebay_host: string, ebay_client_id: string, ebay_redirect_uri: string,
    ebay_scope: string, ebay_consent_api_state: string
) => {
    let url = `${ebay_host}oauth2/authorize?client_id=${ebay_client_id}&response_type=code&redirect_uri=${ebay_redirect_uri}&scope=${ebay_scope}&state=${ebay_consent_api_state}`
    console.log(`askConsent url: ${url}`);
    let data = await fetch(url)
        .then(response => response.headers)

    return data;
}