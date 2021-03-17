import { apiFetch } from '../util';

const initialState = {
    retrieveServerList: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveYetUnseenServerEvents: [],
    createServer: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    serverList: [],
    serverListOpenElements: {
        information: [],
        sampleCurlCommand: [],
        latestEvents: []
    }
};


const retrieveServerListStartedEvent = () => ({
    type: 'RETRIEVE_SERVER_LIST_STARTED_EVENT'
});

const retrieveServerListFailedEvent = (errorMessage) => ({
    type: 'RETRIEVE_SERVER_LIST_FAILED_EVENT',
    errorMessage
});

const retrieveServerListSucceededEvent = (serverList) => ({
    type: 'RETRIEVE_SERVER_LIST_SUCCEEDED_EVENT',
    serverList
});

export const retrieveServerListCommand = () => (dispatch, getState) => {

    dispatch(retrieveServerListStartedEvent());

    let responseWasOk = true;
    apiFetch('/servers', 'GET', getState().session.webappApiKeyId)
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


const retrieveYetUnseenServerEventsStartedEvent = (serverId) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_STARTED_EVENT',
    serverId
});

const retrieveYetUnseenServerEventsFailedEvent = (serverId, errorMessage) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_FAILED_EVENT',
    serverId,
    errorMessage
});

const retrieveYetUnseenServerEventsSucceededEvent = (serverId, yetUnseenServerEvents) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_SUCCEEDED_EVENT',
    serverId,
    yetUnseenServerEvents
});

export const retrieveYetUnseenServerEventsCommand = (serverId, latestSeenSortValue) => (dispatch, getState) => {

    dispatch(retrieveYetUnseenServerEventsStartedEvent(serverId));

    let responseWasOk = true;
    apiFetch(
        `/yet-unseen-server-events?serverId=${encodeURIComponent(serverId)}&latestSeenSortValue=${encodeURIComponent(latestSeenSortValue)}`,
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

        .then(responseContentAsArray => {
            if (!responseWasOk) {
                dispatch(retrieveYetUnseenServerEventsFailedEvent(serverId, responseContentAsArray));
            } else {
                dispatch(retrieveYetUnseenServerEventsSucceededEvent(serverId, responseContentAsArray));
                if (getState().servers.serverListOpenElements.latestEvents.includes(serverId)) {
                    setTimeout(() => {
                        const serverList = getState().servers.serverList;
                        for (let i = 0; i < serverList.length; i++) {
                            if (serverList[i].id === serverId) {
                                dispatch(retrieveYetUnseenServerEventsCommand(serverId, serverList[i].latestEventSortValue));
                            }
                        }
                    }, 2000);
                }
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveYetUnseenServerEventsFailedEvent(serverId, error.toString()));
        });
};


const createServerStartedEvent = () => ({
    type: 'CREATE_SERVER_STARTED_EVENT'
});

const createServerFailedEvent = (errorMessage) => ({
    type: 'CREATE_SERVER_FAILED_EVENT',
    errorMessage
});

const createServerSucceededEvent = (server) => ({
    type: 'CREATE_SERVER_SUCCEEDED_EVENT',
    server
});


export const createServerCommand = (title) => (dispatch, getState) => {

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


export const flippedServerListElementOpenEvent = (serverId, elementName) => ({
    type: 'FLIPPED_SERVER_LIST_ELEMENT_OPEN_EVENT',
    serverId,
    elementName
});

export const flippedServerListElementCloseEvent = (serverId, elementName) => ({
    type: 'FLIPPED_SERVER_LIST_ELEMENT_CLOSE_EVENT',
    serverId,
    elementName
});


const reducer = (state = initialState, action) => {

    const withYetUnseenServerEventsUpdatedServerList = (serverId, yetUnseenServerEvents) => {
        const serverList = [ ...state.serverList ];
        for (let i = 0; i < yetUnseenServerEvents.length; i++) {
            yetUnseenServerEvents[i].hasBeenAddedByYetUnseenLogic = true;
        }
        for (let i = 0; i < serverList.length; i++) {
            if (serverId === serverList[i].id) {
                for (let j = 0; j < serverList[i].latestEvents.length; j++) {
                    serverList[i].latestEvents[j].hasBeenAddedByYetUnseenLogic = false;
                }
                serverList[i].latestEvents = yetUnseenServerEvents.concat(serverList[i].latestEvents).slice(0, 999);
                serverList[i].latestEventSortValue = yetUnseenServerEvents[0].sortValue;
            }
        }
        return serverList;
    };

    switch (action.type) {
        case 'RETRIEVE_SERVER_LIST_STARTED_EVENT':
            return {
                ...state,
                retrieveServerList: {
                    ...initialState.retrieveServerList,
                    isProcessing: true
                }
            };

        case 'RETRIEVE_SERVER_LIST_SUCCEEDED_EVENT':
            return {
                ...state,
                retrieveServerList: {
                    ...initialState.retrieveServerList,
                    justFinishedSuccessfully: true
                },
                serverList: action.serverList
            };

        case 'RETRIEVE_SERVER_LIST_FAILED_EVENT':
            return {
                ...state,
                retrieveServerList: {
                    ...initialState.retrieveServerList,
                    errorMessage: action.errorMessage
                },
                serverList: initialState.serverList
            };


        case 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_SUCCEEDED_EVENT':
            if (action.yetUnseenServerEvents.length > 0) {
                return {
                    ...state,
                    serverList: withYetUnseenServerEventsUpdatedServerList(action.serverId, action.yetUnseenServerEvents)
                };
            } else {
                return state;
            }


        case 'CREATE_SERVER_STARTED_EVENT':
            return {
                ...state,
                createServer: {
                    ...initialState.createServer,
                    isProcessing: true
                }
            };

        case 'CREATE_SERVER_SUCCEEDED_EVENT':
            return {
                ...state,
                createServer: {
                    ...initialState.createServer,
                    justFinishedSuccessfully: true
                },
                serverList: [ action.server, ...state.serverList ],
                serverListOpenElements: {
                    ...state.serverListOpenElements,
                    information: [
                        ...state.serverListOpenElements.information,
                        action.server.id
                    ],
                    sampleCurlCommand: [
                        ...state.serverListOpenElements.sampleCurlCommand,
                        action.server.id
                    ]
                }
            };

        case 'CREATE_SERVER_FAILED_EVENT':
            return {
                ...state,
                createServer: {
                    ...initialState.createServer,
                    errorMessage: action.errorMessage
                }
            };


        case 'FLIPPED_SERVER_LIST_ELEMENT_OPEN_EVENT':
            let updatedStateOpenEvent = { ...state.serverListOpenElements };
            if (action.elementName === 'information') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    information: [
                        ...updatedStateOpenEvent.information,
                        action.serverId
                    ]
                };
            }
            if (action.elementName === 'sampleCurlCommand') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    sampleCurlCommand: [
                        ...updatedStateOpenEvent.sampleCurlCommand,
                        action.serverId
                    ]
                };
            }
            if (action.elementName === 'latestEvents') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    latestEvents: [
                        ...updatedStateOpenEvent.latestEvents,
                        action.serverId
                    ]
                };
            }

            return {
                ...state,
                serverListOpenElements: updatedStateOpenEvent
            };

        case 'FLIPPED_SERVER_LIST_ELEMENT_CLOSE_EVENT':
            let updatedStateCloseEvent = { ...state.serverListOpenElements };
            if (action.elementName === 'information') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    information: updatedStateCloseEvent.information.filter(serverId => serverId !== action.serverId)
                };
            }
            if (action.elementName === 'sampleCurlCommand') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    sampleCurlCommand: updatedStateCloseEvent.sampleCurlCommand.filter(serverId => serverId !== action.serverId)
                };
            }
            if (action.elementName === 'latestEvents') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    latestEvents: updatedStateCloseEvent.latestEvents.filter(serverId => serverId !== action.serverId)
                };
            }

            return {
                ...state,
                serverListOpenElements: updatedStateCloseEvent
            };

        default:
            return state;
    }
}

export default reducer;
export { initialState };
