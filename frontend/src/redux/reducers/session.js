const initialState = {
    isLoggedIn: false,
    processingRegistration: false,
    justFinishedRegistration: false,
    loggedInEmail: null,
    webappApiKeyId: null,
    errorMessage: null
};

const reducer = (state = initialState, action) => {
    console.debug(state, action);
    switch (action.type) {
        case 'REGISTER_ACCOUNT_STARTED':
            return {
                ...state,
                processingRegistration: true
            }

        case 'REGISTER_ACCOUNT_SUCCEEDED':
            return {
                ...state,
                processingRegistration: false,
                justFinishedRegistration: true
            }

        case 'REGISTER_ACCOUNT_FAILED':
            return {
                ...state,
                errorMessage: action.errorMessage
            }

        case 'LOG_INTO_ACCOUNT_STARTED':
            return {
                ...state,
                isLoggedIn: false,
                justFinishedRegistration: false
            }

        case 'LOG_INTO_ACCOUNT_SUCCEEDED':
            return {
                ...state,
                isLoggedIn: true,
                loggedInEmail: action.email,
                webappApiKeyId: action.webappApiKeyId
            }

        default:
            return state
    }
}

export default reducer;
