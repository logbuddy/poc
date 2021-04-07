import { apiFetch } from '../util';
import { DatetimeHelper } from 'herodot-shared';

const initialState = {
    server: {
        id: null,
        type: null,
        title: null,
        events: [],
        structuredDataExplorerEvents: [],
        latestEventSortValue: null,
        numbersOfEventsPerHour: [70, 899, 380]
    },
    showEventPayload: true,
    retrieveEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveYetUnseenEventsOperation: {
        mustBeSkipped: false,
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveStructuredDataExplorerEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    activeStructuredDataExplorerAttributes: [],
    selectedTimelineIntervalStart: DatetimeHelper.timelineConfig.selectedIntervalStart,
    selectedTimelineIntervalEnd: DatetimeHelper.timelineConfig.selectedIntervalEnd,
    timelineIntervalStart: DatetimeHelper.timelineConfig.timelineIntervalStart,
    timelineIntervalEnd: DatetimeHelper.timelineConfig.timelineIntervalEnd,
};

export const makeServerActiveCommand = (server) => (dispatch) => {
    dispatch(madeServerActiveEvent(server));
    dispatch(retrieveEventsCommand());
};

export const madeServerActiveEvent = (server) => ({
    type: 'MADE_SERVER_ACTIVE_EVENT',
    server
});


export const closeActiveServerCommand = () => ({
    type: 'CLOSE_ACTIVE_SERVER_COMMAND'
});


export const retrieveEventsStartedEvent = () => ({
    type: 'RETRIEVE_EVENTS_STARTED_EVENT'
});

export const retrieveEventsFailedEvent = (errorMessage) => ({
    type: 'RETRIEVE_EVENTS_FAILED_EVENT',
    errorMessage
});

const retrieveEventsSucceededEvent = (events) => ({
    type: 'RETRIEVE_EVENTS_SUCCEEDED_EVENT',
    events
});


export const retrieveEventsCommand = () => (dispatch, getState) => {

    dispatch(retrieveEventsStartedEvent());

    let responseWasOk = true;
    apiFetch(
        `/servers/${getState().activeServer.server.id}/events`,
        'GET',
        getState().session.webappApiKeyId,
        null,
        {
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.selectedTimelineIntervalEnd)
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
                dispatch(retrieveEventsFailedEvent(responseContentAsObject));
            } else {
                dispatch(retrieveEventsSucceededEvent(responseContentAsObject));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveEventsFailedEvent(error.toString()));
        });

};

const reducer = (state = initialState, action) => {

    switch (action.type) {

        case 'MADE_SERVER_ACTIVE_EVENT': {
            return {
                ...state,
                server: {
                    ...state.server,
                    id: action.server.id,
                    title: action.server.title,
                    type: action.server.type
                }
            };
        }

        case 'CLOSE_ACTIVE_SERVER_COMMAND': {
            return initialState;
        }


        case 'RETRIEVE_EVENTS_STARTED_EVENT': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: true
                }
            };
        }

        case 'RETRIEVE_EVENTS_FAILED_EVENT': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RETRIEVE_EVENTS_SUCCEEDED_EVENT': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: false,
                    errorMessage: null
                },
                server: {
                    ...state.server,
                    events: action.events
                }
            };
        }


        default: {
            return state;
        }
    }
}

export default reducer;
export { initialState };