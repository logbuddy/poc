export function registerAccount(email, password) {
    return {
        type: 'REGISTER_ACCOUNT',
        email,
        password
    };
}

export function logIntoAccount(email, password) {
    return {
        type: 'LOG_INTO_ACCOUNT',
        email,
        password
    };
}
