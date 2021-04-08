import { apiFetch } from '../util';

const initialState = {
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


const reducer = (state = initialState, action) => {

    switch (action.type) {

        case 'RETRIEVE_SERVER_LIST_STARTED_EVENT':
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    isRunning: true
                }
            };

        case 'RETRIEVE_SERVER_LIST_SUCCEEDED_EVENT': {
            const updateServerlist = (existingServerlist, newServerlist) => {
                const updatedServerlist = [];
                for (let newServerlistEntry of newServerlist) {
                    if (newServerlistEntry.latestEventsBy.length === 0) {
                        for (let existingServerlistEntry of existingServerlist) {
                            if (   existingServerlistEntry.latestEventsBy.length > 0
                                && existingServerlistEntry.id === newServerlistEntry.id
                            ) {
                                newServerlistEntry.latestEventsBy = existingServerlistEntry.latestEventsBy;
                            }
                        }
                    }
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

        case 'RETRIEVE_SERVER_LIST_FAILED_EVENT':
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    errorMessage: action.errorMessage
                },
                serverList: initialState.serverList
            };


        case 'CREATE_SERVER_STARTED_EVENT':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    isRunning: true
                }
            };

        case 'CREATE_SERVER_SUCCEEDED_EVENT':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    justFinishedSuccessfully: true
                },
                serverList: [ action.server, ...state.serverList ],
            };

        case 'CREATE_SERVER_FAILED_EVENT':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    errorMessage: action.errorMessage
                }
            };


        case 'LOG_OUT_OF_ACCOUNT_SUCCEEDED_EVENT': {
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
