import { apiFetch } from '../util';

const initialState = {
    retrieveServerList: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    createServer: {
        isProcessing: false,
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
                dispatch(createServerFailedEvent(responseContentAsObject));
            } else {
                dispatch(createServerSucceededEvent(responseContentAsObject));
                dispatch(retrieveServerListCommand());
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
                serverList: [...state.serverList, action.server]
            };

        case 'CREATE_SERVER_FAILED_EVENT':
            return {
                ...state,
                createServer: {
                    ...initialState.createServer,
                    errorMessage: action.errorMessage
                }
            };

        default:
            return state;
    }
}

export default reducer;
export { initialState };
