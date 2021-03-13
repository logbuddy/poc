const initialState = {
    registeredAccounts: [],
    isLoggedIn: false,
    finishedRegistration: false,
    loggedInEmail: null
};

const reducer = (state = initialState, action) => {
    console.debug(state, action);
    switch (action.type) {
        case 'REGISTER_ACCOUNT':
            let registeredAccounts = JSON.parse(JSON.stringify(state.registeredAccounts));
            registeredAccounts.push({email: action.email, password: action.password});
            return {
                ...state,
                finishedRegistration: true,
                registeredAccounts
            }

        case 'LOG_INTO_ACCOUNT':
            for (let i = 0; i < state.registeredAccounts.length; i++) {
                if (   action.email === state.registeredAccounts[i].email
                    && action.password === state.registeredAccounts[i].password
                ) {
                    return {
                        isLoggedIn: true,
                        loggedInEmail: action.email,
                        ...state
                    }
                }
            }
            return state;
        default:
            return state
    }
}

export default reducer;
