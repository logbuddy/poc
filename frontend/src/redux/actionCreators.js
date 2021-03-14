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

    fetch(
        `https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/users?email=${email}&password=${password}`,
        { method: 'POST', mode: 'cors' }
    )
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                console.debug('here!');
                throw new Error(response.statusText);
            }
            return response.json();
        })

        .then(responseContentAsJson => {
            dispatch(registerAccountSucceeded('4fb59d24-1bb1-4802-9363-ea18f847a5e6', email, password));
        })

        .catch(function(error) {
            dispatch(registerAccountFailed(error.toString()));
        });
};

export function logIntoAccount(email, password) {
    return {
        type: 'LOG_INTO_ACCOUNT',
        email,
        password
    };
}
