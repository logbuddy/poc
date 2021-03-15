const initialState = {
    retrieveServerList: {
        isProcessing: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    serverList: []
};

const retrieveServerListStarted = () => ({
    type: 'RETRIEVE_SERVER_LIST_STARTED'
});

const retrieveServerListFailed = (errorMessage) => ({
    type: 'RETRIEVE_SERVER_LIST_FAILED',
    errorMessage
});

const retrieveServerListSucceeded = (serverList) => ({
    type: 'RETRIEVE_SERVER_LIST_SUCCEEDED',
    serverList
});

export const retrieveServerList = () => (dispatch, getState) => {

    dispatch(retrieveServerListStarted());

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
                dispatch(retrieveServerListFailed(responseContentAsObject));
            } else {
                setTimeout(() => dispatch(retrieveServerListSucceeded(responseContentAsObject)), 1000);
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServerListFailed(error.toString()));
        });
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'RETRIEVE_SERVER_LIST_STARTED':
            return {
                ...state,
                retrieveServerList: {
                    ...initialState.retrieveServerList,
                    isProcessing: true
                }
            };

        case 'RETRIEVE_SERVER_LIST_SUCCEEDED':
            return {
                ...state,
                retrieveServerList: {
                    ...initialState.retrieveServerList,
                    justFinishedSuccessfully: true
                },
                serverList: action.serverList
            };

        case 'RETRIEVE_SERVER_LIST_FAILED':
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
export { initialState, retrieveServerListStarted, retrieveServerListFailed, retrieveServerListSucceeded };
