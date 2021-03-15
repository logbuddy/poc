import config from '../config';

export const apiFetch = (path, method, webappApiKeyId = null, body = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (webappApiKeyId !== null) {
        headers['X-Herodot-Webapp-Api-Key-Id'] = webappApiKeyId;
    }

    return fetch(
        `${config.backendApiBaseUri}${path}`,
        {
            method,
            mode: 'cors',
            headers,
            body
        }
    );
};
