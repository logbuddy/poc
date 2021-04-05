import config from '../config';

export const apiFetch = (path, method, webappApiKeyId = null, body = null, queryParams = {}) => {
    const headers = {
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
