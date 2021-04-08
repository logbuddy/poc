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
    showStructuredDataExplorerAttributes: true,
    informationPanelIsOpen: false,
    examplePanelIsOpen: false,
    currentEventsResultPage: 1,
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
    eventLoadedInStructuredDataExplorer: null,
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


export const switchShowEventPayloadCommand = () => ({
    type: 'SWITCH_SHOW_EVENT_PAYLOAD_COMMAND'
});


export const switchShowStructuredDataExplorerAttributesCommand = () => ({
    type: 'SWITCH_SHOW_STRUCTURED_DATA_EXPLORER_ATTRIBUTES_COMMAND'
});


export const changeCurrentEventsResultPageCommand = (page) => ({
    type: 'CHANGE_CURRENT_EVENTS_RESULT_PAGE_COMMAND',
    page
});


export const loadEventIntoStructuredDataExplorerCommand = (event) => ({
    type: 'LOAD_EVENT_INTO_STRUCTURED_DATA_EXPLORER_COMMAND',
    event
});

export const closeStructuredDataExplorerCommand = () => ({
    type: 'CLOSE_STRUCTURED_DATA_EXPLORER_COMMAND'
});

export const selectActiveStructuredDataExplorerAttributeCommand = (byName, byVal) => ({
    type: 'SELECT_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND',
    byName,
    byVal
});

export const addActiveStructuredDataExplorerAttributeCommand = (byName, byVal) => ({
    type: 'ADD_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND',
    byName,
    byVal
});

export const removeActiveStructuredDataExplorerAttributeCommand = (byName, byVal) => (dispatch, getState) => {
    dispatch(removedActiveStructuredDataExplorerAttributeEvent(byName, byVal));
    if (getState().activeServer.activeStructuredDataExplorerAttributes.length === 0) {
        dispatch(resetStructuredDataExplorerEventsCommand());
    } else {
        dispatch(retrieveStructuredDataExplorerEventsCommand());
    }
};

const removedActiveStructuredDataExplorerAttributeEvent = (byName, byVal) => ({
    type: 'REMOVED_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_EVENT',
    byName,
    byVal
});


const retrieveStructuredDataExplorerEventsStartedEvent = () => ({
    type: 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_STARTED_EVENT'
});

const retrieveStructuredDataExplorerEventsFailedEvent = (errorMessage) => ({
    type: 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_FAILED_EVENT',
    errorMessage
});

const retrieveStructuredDataExplorerEventsSucceededEvent = (events) => ({
    type: 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_SUCCEEDED_EVENT',
    events
});

export const resetStructuredDataExplorerEventsCommand = () => ({
    type: 'RESET_STRUCTURED_DATA_EXPLORER_EVENTS_COMMAND'
});


export const retrieveStructuredDataExplorerEventsCommand = () => (dispatch, getState) => {

    if (getState().activeServer.activeStructuredDataExplorerAttributes.length === 0) {
        console.error('Was asked to retrieve Structured Data Explorer events, but no attributes are set.');
        return;
    }

    dispatch(retrieveStructuredDataExplorerEventsStartedEvent());

    const queryParams = {
        serverId: getState().activeServer.server.id,
        selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.selectedTimelineIntervalStart),
        selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().activeServer.selectedTimelineIntervalEnd)
    };

    let i = 0;
    const attributes = getState().activeServer.activeStructuredDataExplorerAttributes;
    for (let attribute of attributes) {
        queryParams[`byName[${i}]`] = attribute.byName;
        queryParams[`byVal[${i}]`] = attribute.byVal;
        i++;
    }

    let responseWasOk = true;
    apiFetch(
        '/server-events-by',
        'GET',
        getState().session.webappApiKeyId,
        null,
        queryParams
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
                dispatch(retrieveStructuredDataExplorerEventsFailedEvent(responseContentAsArray));
            } else {
                dispatch(retrieveStructuredDataExplorerEventsSucceededEvent(responseContentAsArray));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveStructuredDataExplorerEventsFailedEvent(error.toString()));
        });
};


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


        case 'SWITCH_SHOW_EVENT_PAYLOAD_COMMAND': {
            return {
                ...state,
                showEventPayload: !state.showEventPayload
            };
        }


        case 'SWITCH_SHOW_STRUCTURED_DATA_EXPLORER_ATTRIBUTES_COMMAND': {
            return {
                ...state,
                showStructuredDataExplorerAttributes: !state.showStructuredDataExplorerAttributes
            };
        }


        case 'CHANGE_CURRENT_EVENTS_RESULT_PAGE_COMMAND': {
            return {
                ...state,
                currentEventsResultPage: action.page
            };
        }


        case 'LOAD_EVENT_INTO_STRUCTURED_DATA_EXPLORER_COMMAND': {
            return {
                ...state,
                eventLoadedInStructuredDataExplorer: action.event,
                activeStructuredDataExplorerAttributes: [],
                server: {
                    ...state.server,
                    structuredDataExplorerEvents: []
                }
            };
        }


        case 'CLOSE_STRUCTURED_DATA_EXPLORER_COMMAND': {
            return {
                ...state,
                eventLoadedInStructuredDataExplorer: null,
                activeStructuredDataExplorerAttributes: [],
                server: {
                    ...state.server,
                    structuredDataExplorerEvents: []
                }
            };
        }


        case 'SELECT_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND': {
            return {
                ...state,
                activeStructuredDataExplorerAttributes: [{ byName: action.byName, byVal: action.byVal }]
            };
        }

        case 'ADD_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND': {
            return {
                ...state,
                activeStructuredDataExplorerAttributes: [
                    ...state.activeStructuredDataExplorerAttributes,
                    { byName: action.byName, byVal: action.byVal }
                ]
            };
        }


        case 'REMOVED_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_EVENT': {
            const remainingAttributes = [];
            for (let attribute of state.activeStructuredDataExplorerAttributes) {
                if (!(attribute.byName === action.byName && attribute.byVal === action.byVal)) {
                    remainingAttributes.push(attribute);
                }
            }

            let structuredDataExplorerEvents = [ ...state.server.structuredDataExplorerEvents ];
            if (remainingAttributes.length === 0) {
                structuredDataExplorerEvents = [];
            }

            return {
                ...state,
                activeStructuredDataExplorerAttributes: remainingAttributes,
                server: {
                    ...state.server,
                    structuredDataExplorerEvents
                }
            };
        }


        case 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_STARTED_EVENT': {
            return {
                ...state,
                retrieveStructuredDataExplorerEventsOperation: {
                    ...state.retrieveStructuredDataExplorerEventsOperation,
                    isRunning: true
                }
            };
        }

        case 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_FAILED_EVENT': {
            return {
                ...state,
                retrieveStructuredDataExplorerEventsOperation: {
                    ...state.retrieveStructuredDataExplorerEventsOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RETRIEVE_STRUCTURED_DATA_EXPLORER_EVENTS_SUCCEEDED_EVENT': {
            return {
                ...state,
                retrieveStructuredDataExplorerEventsOperation: {
                    ...state.retrieveStructuredDataExplorerEventsOperation,
                    isRunning: false,
                    errorMessage: null
                },
                server: {
                    ...state.server,
                    structuredDataExplorerEvents: action.events
                }
            };
        }


        case 'RETRIEVE_EVENTS_STARTED_EVENT': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: true
                },
                currentEventsResultPage: 1
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


        case 'LOG_OUT_OF_ACCOUNT_SUCCEEDED_EVENT': {
            return {
                ...initialState
            }
        }


        default: {
            return state;
        }
    }
}

export default reducer;
export { initialState };
