const initialState = {
    isLoggedIn: false,
    processingRegistration: false,
    finishedRegistration: false,
    loggedInEmail: null,
    loggedInUserId: null,
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
                finishedRegistration: true
            }

        case 'REGISTER_ACCOUNT_FAILED':
            return {
                ...state,
                errorMessage: action.errorMessage
            }

        case 'LOG_INTO_ACCOUNT':
            return {
                ...state
            }

        default:
            return state
    }
}

export default reducer;
