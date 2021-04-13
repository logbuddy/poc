import config from '../config';

export const apiFetch = (path: string, method: 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'HEAD', webappApiKeyId: null | string = null, body: null | string = null, queryParams: { [key: string]: string } = {}) => {
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
    };

    if (webappApiKeyId !== null) {
        headers['X-Herodot-Webapp-Api-Key-Id'] = webappApiKeyId;
    }

    let isFirstQueryParam = true;
    let queryParamsString = '';
    for (let queryParamKey in queryParams) {
        if (isFirstQueryParam) {
            queryParamsString = '?';
            isFirstQueryParam = false;
        } else {
            queryParamsString += '&';
        }
        queryParamsString = `${queryParamsString}${queryParamKey}=${encodeURIComponent(queryParams[queryParamKey])}`
    }

    return fetch(
        `${config.backendApiBaseUri}${path}${queryParamsString}`,
        {
            method,
            mode: 'cors',
            headers,
            body
        }
    );
};
