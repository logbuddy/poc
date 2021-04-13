import { apiFetch } from '../util';
import {BasicAction, ErrorAction, Operation, ReduxState} from './root';
import {ThunkDispatch} from "redux-thunk";
import {LogOutOfAccountSucceededEventAction} from "./session";

interface ServerEvent {
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

interface Server {
    id: string,
    type: string,
    title: string,
    userId: string,
    apiKeyId: string,
    events: Array<ServerEvent>,
    structuredDataExplorerEvents: Array<ServerEvent>,
    latestEventSortValue: string,
    numberOfEventsPerHour: Array<number>
}

export interface ServersState {
    showEventPayload: boolean,
    readonly retrieveServerListOperation: Operation,
    readonly createServerOperation: Operation,
    serverList: Array<Server>
}

const initialState: ServersState = {
    showEventPayload: true,
    retrieveServerListOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    createServerOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    serverList: []
};


interface RetrieveServerListStartedEventAction extends BasicAction {
    type: 'RetrieveServerListStartedEvent'
}

const retrieveServerListStartedEvent = (): RetrieveServerListStartedEventAction => ({
    type: 'RetrieveServerListStartedEvent'
});


interface RetrieveServerListFailedEventAction extends ErrorAction {
    type: 'RetrieveServerListFailedEvent'
}

const retrieveServerListFailedEvent = (errorMessage: string): RetrieveServerListFailedEventAction => ({
    type: 'RetrieveServerListFailedEvent',
    errorMessage
});


interface RetrieveServerListSucceededEventAction extends BasicAction {
    type: 'RetrieveServerListSucceededEvent',
    serverList: Array<Server>
}

const retrieveServerListSucceededEvent = (serverList: Array<Server>): RetrieveServerListSucceededEventAction => ({
    type: 'RetrieveServerListSucceededEvent',
    serverList
});


export const retrieveServerListCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

    dispatch(retrieveServerListStartedEvent());

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
                dispatch(retrieveServerListFailedEvent(responseContentAsObject));
            } else {
                dispatch(retrieveServerListSucceededEvent(responseContentAsObject));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServerListFailedEvent(error.toString()));
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

    | RetrieveServerListStartedEventAction
    | RetrieveServerListFailedEventAction
    | RetrieveServerListSucceededEventAction;


const reducer = (state = initialState, action: ServersAction | LogOutOfAccountSucceededEventAction) => {

    switch (action.type) {

        case 'RetrieveServerListStartedEvent':
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    isRunning: true
                }
            };

        case 'RetrieveServerListSucceededEvent': {
            const updateServerlist = (existingServerlist: Array<Server>, newServerlist: Array<Server>) => {
                const updatedServerlist = [];
                for (let newServerlistEntry of newServerlist) {
                    newServerlistEntry.numberOfEventsPerHour = [];
                    for (let i = 0; i < 8*24; i++) {
                        newServerlistEntry.numberOfEventsPerHour.push(Math.round(Math.random() * 1000));
                    }
                    updatedServerlist.push(newServerlistEntry);
                }
                return updatedServerlist;
            };
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    justFinishedSuccessfully: true
                },
                serverList: updateServerlist(state.serverList, action.serverList),
            };
        }

        case 'RetrieveServerListFailedEvent':
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    errorMessage: action.errorMessage
                },
                serverList: initialState.serverList
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
                serverList: [ action.server, ...state.serverList ],
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
