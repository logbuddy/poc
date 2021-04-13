import { apiFetch } from '../util';
import {BasicAction, ErrorAction, Operation, ReduxState} from './root';
import {ThunkDispatch} from "redux-thunk";
import {LogOutOfAccountSucceededEventAction} from "./session";

export interface ServerEvent {
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

export interface Server {
    id: string,
    type: string,
    title: string,
    userId: string,
    apiKeyId: string,
    events: Array<ServerEvent>,
    structuredDataExplorerEvents: Array<ServerEvent>,
    latestEventSortValue: null | string,
    numberOfEventsPerHour: Array<number>
}

export interface ServersState {
    showEventPayload: boolean,
    readonly retrieveServersOperation: Operation,
    readonly createServerOperation: Operation,
    servers: Array<Server>
}

const initialState: ServersState = {
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


interface RetrieveServersStartedEventAction extends BasicAction {
    type: 'RetrieveServersStartedEvent'
}

const retrieveServersStartedEvent = (): RetrieveServersStartedEventAction => ({
    type: 'RetrieveServersStartedEvent'
});


interface RetrieveServersFailedEventAction extends ErrorAction {
    type: 'RetrieveServersFailedEvent'
}

const retrieveServersFailedEvent = (errorMessage: string): RetrieveServersFailedEventAction => ({
    type: 'RetrieveServersFailedEvent',
    errorMessage
});


interface RetrieveServersSucceededEventAction extends BasicAction {
    type: 'RetrieveServersSucceededEvent',
    servers: Array<Server>
}

const retrieveServersSucceededEvent = (servers: Array<Server>): RetrieveServersSucceededEventAction => ({
    type: 'RetrieveServersSucceededEvent',
    servers
});


export const retrieveServersCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

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


interface CreateServerStartedEventAction extends BasicAction {
    type: 'CreateServerStartedEvent'
}

const createServerStartedEvent = (): CreateServerStartedEventAction => ({
    type: 'CreateServerStartedEvent'
});


interface CreateServerFailedEventAction extends ErrorAction {
    type: 'CreateServerFailedEvent'
}

const createServerFailedEvent = (errorMessage: string): CreateServerFailedEventAction => ({
    type: 'CreateServerFailedEvent',
    errorMessage
});


interface CreateServerSucceededEventAction extends BasicAction {
    type: 'CreateServerSucceededEvent',
    server: Server
}

const createServerSucceededEvent = (server: Server): CreateServerSucceededEventAction => ({
    type: 'CreateServerSucceededEvent',
    server
});


export const createServerCommand = (title: string) => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

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


export type ServersAction =
    | CreateServerStartedEventAction
    | CreateServerFailedEventAction
    | CreateServerSucceededEventAction

    | RetrieveServersStartedEventAction
    | RetrieveServersFailedEventAction
    | RetrieveServersSucceededEventAction;


const reducer = (state: ServersState = initialState, action: ServersAction | LogOutOfAccountSucceededEventAction): ServersState => {

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
            const updateServers = (existingServers: Array<Server>, retrievedServers: Array<Server>): Array<Server> => {
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
