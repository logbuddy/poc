import { apiFetch } from '../util';
import { IBasicAction, IErrorAction, IOperation, IReduxState } from './root';
import { ThunkDispatch } from 'redux-thunk';
import { ILogOutOfAccountSucceededEventAction } from './session';

export interface IServerEvent {
    id: string,
    serverId: string,
    userId: string,
    receivedAt: number,
    sortValue: string,
    createdAt: string,
    createdAtUtc: string,
    source: string,
    payload: string,
}

export interface IServer {
    id: string,
    type: string,
    title: string,
    userId: string,
    apiKeyId: string,
    events: Array<IServerEvent>,
    structuredDataExplorerEvents: Array<IServerEvent>,
    latestEventSortValue: null | string,
    numberOfEventsPerHour: Array<number>
}

export interface IServersState {
    showEventPayload: boolean,
    readonly retrieveServersOperation: IOperation,
    readonly createServerOperation: IOperation,
    servers: Array<IServer>
}

const initialState: IServersState = {
    showEventPayload: true,
    retrieveServersOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    createServerOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    servers: []
};


interface IRetrieveServersStartedEventAction extends IBasicAction {
    type: 'RetrieveServersStartedEvent'
}

const retrieveServersStartedEvent = (): IRetrieveServersStartedEventAction => ({
    type: 'RetrieveServersStartedEvent'
});


interface IRetrieveServersFailedEventAction extends IErrorAction {
    type: 'RetrieveServersFailedEvent'
}

const retrieveServersFailedEvent = (errorMessage: string): IRetrieveServersFailedEventAction => ({
    type: 'RetrieveServersFailedEvent',
    errorMessage
});


interface IRetrieveServersSucceededEventAction extends IBasicAction {
    type: 'RetrieveServersSucceededEvent',
    servers: Array<IServer>
}

const retrieveServersSucceededEvent = (servers: Array<IServer>): IRetrieveServersSucceededEventAction => ({
    type: 'RetrieveServersSucceededEvent',
    servers
});


export const retrieveServersCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

    dispatch(retrieveServersStartedEvent());

    let responseWasOk = true;
    apiFetch(
        '/servers',
        'GET',
        getState().session.webappApiKeyId
    )
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsObject => {
            if (!responseWasOk) {
                dispatch(retrieveServersFailedEvent(responseContentAsObject));
            } else {
                dispatch(retrieveServersSucceededEvent(responseContentAsObject));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServersFailedEvent(error.toString()));
        });
};


interface ICreateServerStartedEventAction extends IBasicAction {
    type: 'CreateServerStartedEvent'
}

const createServerStartedEvent = (): ICreateServerStartedEventAction => ({
    type: 'CreateServerStartedEvent'
});


interface ICreateServerFailedEventAction extends IErrorAction {
    type: 'CreateServerFailedEvent'
}

const createServerFailedEvent = (errorMessage: string): ICreateServerFailedEventAction => ({
    type: 'CreateServerFailedEvent',
    errorMessage
});


interface ICreateServerSucceededEventAction extends IBasicAction {
    type: 'CreateServerSucceededEvent',
    server: IServer
}

const createServerSucceededEvent = (server: IServer): ICreateServerSucceededEventAction => ({
    type: 'CreateServerSucceededEvent',
    server
});


export const createServerCommand = (title: string) => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

    dispatch(createServerStartedEvent());

    let responseWasOk = true;
    apiFetch('/servers', 'POST', getState().session.webappApiKeyId, JSON.stringify({title}))
        .then(response => {
            console.debug(response);
            if (!response.ok) {
                responseWasOk = false;
            }
            return response.json();
        })

        .then(responseContentAsObject => {
            if (!responseWasOk) {
                console.debug('responseContentAsObject', responseContentAsObject);
                dispatch(createServerFailedEvent(responseContentAsObject));
            } else {
                dispatch(createServerSucceededEvent(responseContentAsObject));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(createServerFailedEvent(error.toString()));
        });
};


export type TServersAction =
    | ICreateServerStartedEventAction
    | ICreateServerFailedEventAction
    | ICreateServerSucceededEventAction

    | IRetrieveServersStartedEventAction
    | IRetrieveServersFailedEventAction
    | IRetrieveServersSucceededEventAction;


const reducer = (state: IServersState = initialState, action: TServersAction | ILogOutOfAccountSucceededEventAction): IServersState => {

    switch (action.type) {

        case 'RetrieveServersStartedEvent':
            return {
                ...state,
                retrieveServersOperation: {
                    ...initialState.retrieveServersOperation,
                    isRunning: true
                }
            };

        case 'RetrieveServersSucceededEvent': {
            const updateServers = (existingServers: Array<IServer>, retrievedServers: Array<IServer>): Array<IServer> => {
                const updatedServers = [];
                for (let server of retrievedServers) {
                    server.numberOfEventsPerHour = [];
                    for (let i = 0; i < 8*24; i++) {
                        server.numberOfEventsPerHour.push(Math.round(Math.random() * 1000));
                    }
                    updatedServers.push(server);
                }
                return updatedServers;
            };
            return {
                ...state,
                retrieveServersOperation: {
                    ...initialState.retrieveServersOperation,
                    justFinishedSuccessfully: true
                },
                servers: updateServers(state.servers, action.servers),
            };
        }

        case 'RetrieveServersFailedEvent':
            return {
                ...state,
                retrieveServersOperation: {
                    ...initialState.retrieveServersOperation,
                    errorMessage: action.errorMessage
                },
                servers: initialState.servers
            };


        case 'CreateServerStartedEvent':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    isRunning: true
                }
            };

        case 'CreateServerSucceededEvent':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    justFinishedSuccessfully: true
                },
                servers: [ action.server, ...state.servers ],
            };

        case 'CreateServerFailedEvent':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    errorMessage: action.errorMessage
                }
            };


        case 'LogOutOfAccountSucceededEvent': {
            return {
                ...initialState
            }
        }


        default:
            return state;
    }
}

export default reducer;
export { initialState };
