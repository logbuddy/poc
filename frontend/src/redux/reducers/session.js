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

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'REGISTER_ACCOUNT_STARTED':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    isProcessing: true
                }
            }

        case 'REGISTER_ACCOUNT_SUCCEEDED':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    justFinishedSuccessfully: true
                }
            }

        case 'REGISTER_ACCOUNT_FAILED':
            return {
                ...state,
                registration: {
                    ...initialState.registration,
                    errorMessage: action.errorMessage
                }
            }


        case 'LOG_INTO_ACCOUNT_STARTED':
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

        case 'LOG_INTO_ACCOUNT_SUCCEEDED':
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

        case 'LOG_INTO_ACCOUNT_FAILED':
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
