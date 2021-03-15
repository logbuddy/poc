import { apiFetch } from '../util';

const initialState = {
    isLoggedIn: false,
    loggedInEmail: null,
    webappApiKeyId: null,
    registration: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    login: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    }
};


const registerAccountStartedEvent = () => ({
    type: 'REGISTER_ACCOUNT_STARTED_EVENT'
});

const registerAccountFailedEvent = (errorMessage) => ({
    type: 'REGISTER_ACCOUNT_FAILED_EVENT',
    errorMessage
});

const registerAccountSucceededEvent = (userId, email, password) => ({
    type: 'REGISTER_ACCOUNT_SUCCEEDED_EVENT',
    userId,
    email,
    password
});

export const registerAccountCommand = (email, password) => (dispatch) => {

    dispatch(registerAccountStartedEvent());

    let responseWasOk = true;
    apiFetch('/users', 'POST', null, JSON.stringify({email, password}))
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsObject => {
            if (!responseWasOk) {
                console.debug(responseContentAsObject);
                dispatch(registerAccountFailedEvent(responseContentAsObject));
            } else {
                dispatch(registerAccountSucceededEvent(JSON.parse(responseContentAsObject), email, password));
            }
        })

        .catch(function (error) {
            dispatch(registerAccountFailedEvent(error.toString()));
        });
};


const logIntoAccountStartedEvent = () => ({
    type: 'LOG_INTO_ACCOUNT_STARTED_EVENT'
});

const logIntoAccountFailedEvent = (errorMessage) => ({
    type: 'LOG_INTO_ACCOUNT_FAILED_EVENT',
    errorMessage
});

const logIntoAccountSucceededEvent = (apiKeyId, email, password) => ({
    type: 'LOG_INTO_ACCOUNT_SUCCEEDED_EVENT',
    webappApiKeyId: apiKeyId,
    email,
    password
});

export const logIntoAccountCommand = (email, password) => (dispatch) => {

    dispatch(logIntoAccountStartedEvent());

    let responseWasOk = true;
    apiFetch('/webapp-api-keys', 'POST', null, JSON.stringify({email, password}))
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsObject => {
            if (!responseWasOk) {
                dispatch(logIntoAccountFailedEvent(responseContentAsObject));
            } else {
                dispatch(logIntoAccountSucceededEvent(responseContentAsObject, email, password));
            }
        })

        .catch(function (error) {
            console.error(error)
            dispatch(logIntoAccountFailedEvent(error.toString()));
        });
};


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'REGISTER_ACCOUNT_STARTED_EVENT':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    isProcessing: true
                }
            }

        case 'REGISTER_ACCOUNT_SUCCEEDED_EVENT':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    justFinishedSuccessfully: true
                }
            }

        case 'REGISTER_ACCOUNT_FAILED_EVENT':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    errorMessage: action.errorMessage
                }
            }


        case 'LOG_INTO_ACCOUNT_STARTED_EVENT':
            return {
                ...state,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
                login: {
                    ...initialState.login,
                    isProcessing: true
                }
            }

        case 'LOG_INTO_ACCOUNT_SUCCEEDED_EVENT':
            document.cookie = `loggedInEmail=${action.email};path=/`;
            document.cookie = `webappApiKeyId=${action.webappApiKeyId};path=/`;
            return {
                ...state,
                isLoggedIn: true,
                loggedInEmail: action.email,
                webappApiKeyId: action.webappApiKeyId,
                login: {
                    ...initialState.login,
                    justFinishedSuccessfully: true
                }
            }

        case 'LOG_INTO_ACCOUNT_FAILED_EVENT':
            return {
                ...state,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
                login: {
                    ...initialState.login,
                    errorMessage: action.errorMessage
                }
            }

        default:
            return state
    }
}

export default reducer;
export { initialState };
