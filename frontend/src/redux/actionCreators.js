export function registerAccountStarted() {
    return {
        type: 'REGISTER_ACCOUNT_STARTED'
    };
}

export function registerAccountFailed(errorMessage) {
    return {
        type: 'REGISTER_ACCOUNT_FAILED',
        errorMessage
    };
}

export function registerAccountSucceeded(userId, email, password) {
    return {
        type: 'REGISTER_ACCOUNT_SUCCEEDED',
        userId,
        email,
        password
    };
}

export const registerAccount = (email, password) => (dispatch) => {

    dispatch(registerAccountStarted());

    let responseWasOk = true;
    fetch(
        `https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/users`,
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        }
    )
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsJson => {
            if (!responseWasOk) {
                console.debug(responseContentAsJson);
                dispatch(registerAccountFailed(responseContentAsJson));
            } else {
                dispatch(registerAccountSucceeded(JSON.parse(responseContentAsJson), email, password));
            }
        })

        .catch(function(error) {
            dispatch(registerAccountFailed(error.toString()));
        });
};


export function logIntoAccountStarted() {
    return {
        type: 'LOG_INTO_ACCOUNT_STARTED'
    };
}

export function logIntoAccountFailed(errorMessage) {
    return {
        type: 'LOG_INTO_ACCOUNT_FAILED',
        errorMessage
    };
}

export function logIntoAccountSucceeded(apiKeyId, email, password) {
    return {
        type: 'LOG_INTO_ACCOUNT_SUCCEEDED',
        webappApiKeyId: apiKeyId,
        email,
        password
    };
}

export const logIntoAccount = (email, password) => (dispatch) => {

    dispatch(logIntoAccountStarted());

    let responseWasOk = true;
    fetch(
        `https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/webapp-api-keys`,
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        }
    )
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsJson => {
            if (!responseWasOk) {
                dispatch(logIntoAccountFailed(responseContentAsJson));
            } else {
                dispatch(logIntoAccountSucceeded(JSON.parse(responseContentAsJson), email, password));
            }
        })

        .catch(function(error) {
            dispatch(logIntoAccountFailed(error.toString()));
        });
};
