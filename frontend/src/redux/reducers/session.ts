import { apiFetch } from '../util';
import { Dispatch } from 'redux';
import {BasicAction, ErrorAction, Operation} from './root';

interface SessionState {
    readonly isLoggedIn: boolean,
    readonly loggedInEmail: null | string,
    readonly webappApiKeyId: null | string,
    readonly registrationOperation: Operation,
    readonly loginOperation: Operation
}

const initialState: SessionState = {
    isLoggedIn: false,
    loggedInEmail: null,
    webappApiKeyId: null,
    registrationOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    loginOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    }
};


interface RegisterAccountStartedEventAction extends BasicAction {
    readonly type: 'RegisterAccountStartedEvent'
}

const registerAccountStartedEvent = (): RegisterAccountStartedEventAction => ({
    type: 'RegisterAccountStartedEvent'
});


interface RegisterAccountFailedEventAction extends ErrorAction {
    type: 'RegisterAccountFailedEvent'
}

const registerAccountFailedEvent = (errorMessage: string): RegisterAccountFailedEventAction => ({
    type: 'RegisterAccountFailedEvent',
    errorMessage
});


interface RegisterAccountSucceededEventAction extends BasicAction {
    type: 'RegisterAccountSucceededEvent',
    readonly userId: string,
    readonly email: string
}


const registerAccountSucceededEvent = (userId: string, email: string): RegisterAccountSucceededEventAction => ({
    type: 'RegisterAccountSucceededEvent',
    userId,
    email
});

export const registerAccountCommand = (email: string, password: string) => (dispatch: Dispatch): void => {

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
                dispatch(registerAccountSucceededEvent(responseContentAsObject, email));
            }
        })

        .catch(function (error) {
            dispatch(registerAccountFailedEvent(error.toString()));
        });
};


interface LogIntoAccountStartedEventAction extends BasicAction {
    type: 'LogIntoAccountStartedEvent'
}

const logIntoAccountStartedEvent = (): LogIntoAccountStartedEventAction => ({
    type: 'LogIntoAccountStartedEvent'
});


interface LogIntoAccountFailedEventAction extends ErrorAction {
    type: 'LogIntoAccountFailedEvent'
}

const logIntoAccountFailedEvent = (errorMessage: string): LogIntoAccountFailedEventAction => ({
    type: 'LogIntoAccountFailedEvent',
    errorMessage
});


interface LogIntoAccountSucceededEventAction extends BasicAction {
    readonly type: 'LogIntoAccountSucceededEvent',
    readonly email: string,
    readonly webappApiKeyId: string
}

const logIntoAccountSucceededEvent = (webappApiKeyId: string, email: string): LogIntoAccountSucceededEventAction => ({
    type: 'LogIntoAccountSucceededEvent',
    webappApiKeyId,
    email
});

export const logIntoAccountCommand = (email: string, password: string) => (dispatch: Dispatch): void => {

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
                dispatch(logIntoAccountSucceededEvent(responseContentAsObject, email));
            }
        })

        .catch(function (error) {
            console.error(error)
            dispatch(logIntoAccountFailedEvent(error.toString()));
        });
};


interface LogOutOfAccountStartedEventAction extends BasicAction {
    type: 'LogOutOfAccountStartedEvent'
}

const logOutOfAccountStartedEvent = (): LogOutOfAccountStartedEventAction => ({
    type: 'LogOutOfAccountStartedEvent'
});


interface LogOutOfAccountSucceededEventAction extends BasicAction {
    type: 'LogOutOfAccountSucceededEvent'
}

const logOutOfAccountSucceededEvent = (): LogOutOfAccountSucceededEventAction => ({
    type: 'LogOutOfAccountSucceededEvent'
});

export const logOutOfAccountCommand = () => (dispatch: Dispatch): void => {
    dispatch(logOutOfAccountStartedEvent());
    document.cookie = `loggedInEmail=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
    document.cookie = `webappApiKeyId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
    dispatch(logOutOfAccountSucceededEvent());
};


export type SessionAction =
    | LogIntoAccountStartedEventAction
    | LogIntoAccountFailedEventAction
    | LogIntoAccountSucceededEventAction

    | RegisterAccountStartedEventAction
    | RegisterAccountFailedEventAction
    | RegisterAccountSucceededEventAction

    | LogOutOfAccountStartedEventAction
    | LogOutOfAccountSucceededEventAction;


const reducer = (state = initialState, action: SessionAction): SessionState => {
    switch (action.type) {
        case 'RegisterAccountStartedEvent':
            return {
                ...state,
                registrationOperation: {
                    ...initialState.registrationOperation,
                    isRunning: true
                }
            }

        case 'RegisterAccountSucceededEvent':
            return {
                ...state,
                registrationOperation: {
                    ...initialState.registrationOperation,
                    justFinishedSuccessfully: true
                }
            }

        case 'RegisterAccountFailedEvent':
            return {
                ...state,
                registrationOperation: {
                    ...initialState.registrationOperation,
                    errorMessage: action.errorMessage
                }
            }


        case 'LogIntoAccountStartedEvent':
            return {
                ...state,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
                loginOperation: {
                    ...initialState.loginOperation,
                    isRunning: true
                }
            }

        case 'LogIntoAccountSucceededEvent':
            document.cookie = `loggedInEmail=${action.email};path=/`;
            document.cookie = `webappApiKeyId=${action.webappApiKeyId};path=/`;
            return {
                ...state,
                isLoggedIn: true,
                loggedInEmail: action.email,
                webappApiKeyId: action.webappApiKeyId,
                loginOperation: {
                    ...initialState.loginOperation,
                    justFinishedSuccessfully: true
                }
            }

        case 'LogIntoAccountFailedEvent':
            return {
                ...state,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
                loginOperation: {
                    ...initialState.loginOperation,
                    errorMessage: action.errorMessage
                }
            }

        case 'LogOutOfAccountSucceededEvent':
            return {
                ...initialState,
                isLoggedIn: false,
                loggedInEmail: null,
                webappApiKeyId: null,
            }

        default:
            return state
    }
}

export default reducer;
export { initialState };
