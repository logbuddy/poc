import { apiFetch } from '../util';
import { IBasicAction, IErrorAction, IOperation, IReduxState } from './root';
import { ThunkDispatch } from 'redux-thunk';

export interface SessionState {
    readonly isLoggedIn: boolean,
    readonly loggedInEmail: null | string,
    readonly webappApiKeyId: null | string,
    readonly registrationOperation: IOperation,
    readonly loginOperation: IOperation
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


interface IRegisterAccountStartedEventAction extends IBasicAction {
    readonly type: 'RegisterAccountStartedEvent'
}

const registerAccountStartedEvent = (): IRegisterAccountStartedEventAction => ({
    type: 'RegisterAccountStartedEvent'
});


interface IRegisterAccountFailedEventAction extends IErrorAction {
    readonly type: 'RegisterAccountFailedEvent'
}

const registerAccountFailedEvent = (errorMessage: string): IRegisterAccountFailedEventAction => ({
    type: 'RegisterAccountFailedEvent',
    errorMessage
});


interface IRegisterAccountSucceededEventAction extends IBasicAction {
    readonly type: 'RegisterAccountSucceededEvent',
    readonly userId: string,
    readonly email: string
}


const registerAccountSucceededEvent = (userId: string, email: string): IRegisterAccountSucceededEventAction => ({
    type: 'RegisterAccountSucceededEvent',
    userId,
    email
});

export const registerAccountCommand = (email: string, password: string) => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>): void => {

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


interface ILogIntoAccountStartedEventAction extends IBasicAction {
    readonly type: 'LogIntoAccountStartedEvent'
}

const logIntoAccountStartedEvent = (): ILogIntoAccountStartedEventAction => ({
    type: 'LogIntoAccountStartedEvent'
});


interface ILogIntoAccountFailedEventAction extends IErrorAction {
    readonly type: 'LogIntoAccountFailedEvent'
}

const logIntoAccountFailedEvent = (errorMessage: string): ILogIntoAccountFailedEventAction => ({
    type: 'LogIntoAccountFailedEvent',
    errorMessage
});


interface ILogIntoAccountSucceededEventAction extends IBasicAction {
    readonly type: 'LogIntoAccountSucceededEvent',
    readonly email: string,
    readonly webappApiKeyId: string
}

const logIntoAccountSucceededEvent = (webappApiKeyId: string, email: string): ILogIntoAccountSucceededEventAction => ({
    type: 'LogIntoAccountSucceededEvent',
    webappApiKeyId,
    email
});

export const logIntoAccountCommand = (email: string, password: string) => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>) => {

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


interface ILogOutOfAccountStartedEventAction extends IBasicAction {
    readonly type: 'LogOutOfAccountStartedEvent'
}

const logOutOfAccountStartedEvent = (): ILogOutOfAccountStartedEventAction => ({
    type: 'LogOutOfAccountStartedEvent'
});


export interface ILogOutOfAccountSucceededEventAction extends IBasicAction {
    readonly type: 'LogOutOfAccountSucceededEvent'
}

const logOutOfAccountSucceededEvent = (): ILogOutOfAccountSucceededEventAction => ({
    type: 'LogOutOfAccountSucceededEvent'
});

export const logOutOfAccountCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>): void => {
    dispatch(logOutOfAccountStartedEvent());
    document.cookie = `loggedInEmail=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
    document.cookie = `webappApiKeyId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax`;
    dispatch(logOutOfAccountSucceededEvent());
};


export type TSessionAction =
    | ILogIntoAccountStartedEventAction
    | ILogIntoAccountFailedEventAction
    | ILogIntoAccountSucceededEventAction

    | IRegisterAccountStartedEventAction
    | IRegisterAccountFailedEventAction
    | IRegisterAccountSucceededEventAction

    | ILogOutOfAccountStartedEventAction
    | ILogOutOfAccountSucceededEventAction;


const reducer = (state = initialState, action: TSessionAction): SessionState => {
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
