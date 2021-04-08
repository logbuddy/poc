import { apiFetch } from '../util';
import { DatetimeHelper } from 'herodot-shared';

const initialState = {
    server: {
        id: null,
        type: null,
        title: null,
        userId: null,
        apiKeyId: null,
        events: [],
        structuredDataExplorerEvents: [],
        latestEventSortValue: null,
        numberOfEventsPerHour: []
    },
    showEventPayload: true,
    informationPanelIsOpen: false,
    examplePanelIsOpen: false,
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
    retrieveNumberOfEventsPerHourOperation: {
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
    selectedTimelineIntervalStart: DatetimeHelper.timelineConfig.selectedTimelineIntervalStart,
    selectedTimelineIntervalEnd: DatetimeHelper.timelineConfig.selectedTimelineIntervalEnd,
    timelineIntervalStart: DatetimeHelper.timelineConfig.timelineIntervalStart,
    timelineIntervalEnd: DatetimeHelper.timelineConfig.timelineIntervalEnd,
};

export const makeServerActiveCommand = (server) => (dispatch) => {
    dispatch(madeServerActiveEvent(server));
    dispatch(retrieveEventsCommand());
    dispatch(retrieveNumberOfEventsPerHourCommand());
};

export const madeServerActiveEvent = (server) => ({
    type: 'MADE_SERVER_ACTIVE_EVENT',
    server
});


export const closeActiveServerCommand = () => ({
    type: 'CLOSE_ACTIVE_SERVER_COMMAND'
});


export const switchInformationPanelCommand = () => ({
    type: 'SWITCH_INFORMATION_PANEL_COMMAND'
});

export const switchExamplePanelCommand = () => ({
    type: 'SWITCH_EXAMPLE_PANEL_COMMAND'
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


export const retrieveNumberOfEventsPerHourStartedEvent = () => ({
    type: 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_STARTED_EVENT'
});

export const retrieveNumberOfEventsPerHourFailedEvent = (errorMessage) => ({
    type: 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_FAILED_EVENT',
    errorMessage
});

const retrieveNumberOfEventsPerHourSucceededEvent = (numberOfEventsPerHour) => ({
    type: 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_SUCCEEDED_EVENT',
    numberOfEventsPerHour
});

export const retrieveNumberOfEventsPerHourCommand = () => (dispatch, getState) => {

    dispatch(retrieveNumberOfEventsPerHourStartedEvent());

    let responseWasOk = true;
    apiFetch(
        `/servers/${getState().activeServer.server.id}/number-of-events-per-hour`,
        'GET',
        getState().session.webappApiKeyId,
        null,
        {
            timelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.timelineIntervalStart),
            timelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.timelineIntervalEnd)
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
                dispatch(retrieveNumberOfEventsPerHourFailedEvent(responseContentAsObject));
            } else {
                dispatch(retrieveNumberOfEventsPerHourSucceededEvent(responseContentAsObject));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveNumberOfEventsPerHourFailedEvent(error.toString()));
        });

};


export const selectedTimelineIntervalsUpdatedEvent = (selectedTimelineIntervalStart, selectedTimelineIntervalEnd) => ({
    type: 'SELECTED_TIMELINE_INTERVALS_UPDATED_EVENT',
    selectedTimelineIntervalStart,
    selectedTimelineIntervalEnd
})


const reducer = (state = initialState, action) => {

    switch (action.type) {

        case 'MADE_SERVER_ACTIVE_EVENT': {
            return {
                ...state,
                server: {
                    ...action.server,
                    events: [],
                    structuredDataExplorerEvents: [],
                    latestEventSortValue: null,
                    numberOfEventsPerHour: []
                }
            };
        }

        case 'CLOSE_ACTIVE_SERVER_COMMAND': {
            return initialState;
        }


        case 'SWITCH_INFORMATION_PANEL_COMMAND': {
            return {
                ...state,
                informationPanelIsOpen: !state.informationPanelIsOpen
            };
        }


        case 'SWITCH_EXAMPLE_PANEL_COMMAND': {
            return {
                ...state,
                examplePanelIsOpen: !state.examplePanelIsOpen
            };
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


        case 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_STARTED_EVENT': {
            return {
                ...state,
                retrieveNumberOfEventsPerHourOperation: {
                    ...state.retrieveNumberOfEventsPerHourOperation,
                    isRunning: true
                }
            };
        }

        case 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_FAILED_EVENT': {
            return {
                ...state,
                retrieveNumberOfEventsPerHourOperation: {
                    ...state.retrieveNumberOfEventsPerHourOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RETRIEVE_NUMBER_OF_EVENTS_PER_HOUR_SUCCEEDED_EVENT': {
            return {
                ...state,
                retrieveNumberOfEventsPerHourOperation: {
                    ...state.retrieveNumberOfEventsPerHourOperation,
                    isRunning: false,
                    errorMessage: null
                },
                server: {
                    ...state.server,
                    numberOfEventsPerHour: action.numberOfEventsPerHour
                }
            };
        }


        case 'SELECTED_TIMELINE_INTERVALS_UPDATED_EVENT': {
            return {
                ...state,
                selectedTimelineIntervalStart: action.selectedTimelineIntervalStart,
                selectedTimelineIntervalEnd: action.selectedTimelineIntervalEnd
            };
        }


        default: {
            return state;
        }
    }
}

export default reducer;
export { initialState };
