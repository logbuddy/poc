const initialState = {
    registeredAccounts: [],
    isLoggedIn: false,
    finishedRegistration: false,
    loggedInEmail: null,
    errorMessage: null
};

const reducer = (state = initialState, action) => {
    console.debug(state, action);
    switch (action.type) {
        case 'REGISTER_ACCOUNT_SUCCEEDED':
            let registeredAccounts = JSON.parse(JSON.stringify(state.registeredAccounts));
            registeredAccounts.push({userId: action.userId, email: action.email, password: action.password});
            return {
                ...state,
                finishedRegistration: true,
                registeredAccounts
            }

        case 'REGISTER_ACCOUNT_FAILED':
            return {
                ...state,
                errorMessage: action.errorMessage
            }

        case 'LOG_INTO_ACCOUNT':
            for (let i = 0; i < state.registeredAccounts.length; i++) {
                if (   action.email === state.registeredAccounts[i].email
                    && action.password === state.registeredAccounts[i].password
                ) {
                    return {
                        ...state,
                        isLoggedIn: true,
                        loggedInEmail: action.email
                    }
                }
            }
            return {
                ...state,
                errorMessage: 'Invalid credentials'
            }
        default:
            return state
    }
}

export default reducer;
