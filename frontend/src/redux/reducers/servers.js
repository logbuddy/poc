const initialState = {
    retrieveServerList: {
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
    fetch(
        `https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/servers`,
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'X-Herodot-Webapp-Api-Key-Id': getState().session.webappApiKeyId
            },
        }
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
                setTimeout(() => dispatch(retrieveServerListSucceededEvent(responseContentAsObject)), 1000);
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServerListFailedEvent(error.toString()));
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

        default:
            return state;
    }
}

export default reducer;
export { initialState, retrieveServerListStartedEvent, retrieveServerListFailedEvent, retrieveServerListSucceededEvent };
