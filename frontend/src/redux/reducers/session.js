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
    console.debug(state, action);
    switch (action.type) {
        case 'REGISTER_ACCOUNT_STARTED':
            return {
                ...state,
                registration: {
                    ...state.registration,
                    isProcessing: true,
                    justFinishedSuccessfully: false,
                    errorMessage: null
                }
            }

        case 'REGISTER_ACCOUNT_SUCCEEDED':
            return {
                ...state,
                registration: {
                    ...state.registration,
                    isProcessing: false,
                    justFinishedSuccessfully: true
                }
            }

        case 'REGISTER_ACCOUNT_FAILED':
            return {
                ...state,
                registration: {
                    ...state.registration,
                    isProcessing: false,
                    justFinishedSuccessfully: false,
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
                    ...state.login,
                    isProcessing: true,
                    justFinishedSuccessfully: false,
                    errorMessage: null
                }
            }

        case 'LOG_INTO_ACCOUNT_SUCCEEDED':
            return {
                ...state,
                isLoggedIn: true,
                loggedInEmail: action.email,
                webappApiKeyId: action.webappApiKeyId,
                login: {
                    ...state.login,
                    isProcessing: false,
                    justFinishedSuccessfully: true,
                    errorMessage: null
                }
            }

        case 'LOG_INTO_ACCOUNT_FAILED':
            return {
                ...state,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
                login: {
                    isProcessing: false,
                    justFinishedSuccessfully: false,
                    errorMessage: action.errorMessage
                }
            }

        default:
            return state
    }
}

export default reducer;
