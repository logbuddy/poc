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

    fetch(`https://api.github.com?email=${email}&password=${password}`)
        .then(data => data.json())
        .then(dataAsJson => {
            dispatch(registerAccountSucceeded('4fb59d24-1bb1-4802-9363-ea18f847a5e6', email, password))
        })
        .catch(function(error) {
            dispatch(registerAccountFailed(error.message()));
        });
};

export function logIntoAccount(email, password) {
    return {
        type: 'LOG_INTO_ACCOUNT',
        email,
        password
    };
}
