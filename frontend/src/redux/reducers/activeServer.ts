// @ts-ignore
import { DatetimeHelper } from 'herodot-shared';
import { apiFetch } from '../util';
import { ServerEvent } from './servers';
import { BasicAction, ErrorAction, Operation, ReduxState } from './root';
import { ThunkDispatch } from 'redux-thunk';

export const LOG_EVENTS_PRESENTATION_MODE_DEFAULT = 0;
export const LOG_EVENTS_PRESENTATION_MODE_COMPACT = 1;

interface Server {
    id: null | string,
    type: null | string,
    title: null | string,
    userId: null | string,
    apiKeyId: null | string,
    events: Array<ServerEvent>,
    structuredDataExplorerEvents: Array<ServerEvent>,
    latestEventSortValue: null | string,
    numberOfEventsPerHour: Array<number>
}

export interface ActiveServerState {
    server: Server,
    logEventsPresentationMode: 0 | 1,
    pollForYetUnseenEvents: boolean,
    skipPollingForYetUnseenEvents: boolean,
    showEventPayload: boolean,
    showStructuredDataExplorerAttributes: boolean,
    informationPanelIsOpen: boolean,
    examplePanelIsOpen: boolean,
    currentEventsResultPage: number,
    retrieveEventsOperation: Operation,
    retrieveYetUnseenEventsOperation: Operation & {
        mustBeSkipped: false,
    },
    retrieveNumberOfEventsPerHourOperation: Operation & {
        mustBeSkipped: false,
    },
    retrieveStructuredDataExplorerEventsOperation: Operation,
    eventLoadedInStructuredDataExplorer: null | ServerEvent,
    activeStructuredDataExplorerAttributes: Array<any>,
    selectedTimelineIntervalStart: Date,
    selectedTimelineIntervalEnd: Date,
    timelineIntervalStart: Date,
    timelineIntervalEnd: Date
}

export const initialState: ActiveServerState = {
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
    logEventsPresentationMode: LOG_EVENTS_PRESENTATION_MODE_DEFAULT,
    pollForYetUnseenEvents: true,
    skipPollingForYetUnseenEvents: false,
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


export const makeServerActiveCommand = (server: Server) => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>) => {
    dispatch(madeServerActiveEvent(server));
};


interface MadeServerActiveEventAction extends BasicAction {
    type: 'MadeServerActiveCommand'
    server: Server
}

export const madeServerActiveEvent = (server: Server): MadeServerActiveEventAction => ({
    type: 'MadeServerActiveCommand',
    server
});


interface CloseActiveServerCommandAction extends BasicAction {
    type: 'CloseActiveServerCommand'
}

export const closeActiveServerCommand = (): CloseActiveServerCommandAction => ({
    type: 'CloseActiveServerCommand'
});


interface CycleLogEventsPresentationModeCommandAction extends BasicAction {
    type: 'CycleLogEventsPresentationModeCommand'
}

export const cycleLogEventsPresentationModeCommand = (): CycleLogEventsPresentationModeCommandAction => ({
    type: 'CycleLogEventsPresentationModeCommand'
});


interface SwitchInformationPanelCommandAction extends BasicAction {
    type: 'SwitchInformationPanelCommand'
}

export const switchInformationPanelCommand = (): SwitchInformationPanelCommandAction => ({
    type: 'SwitchInformationPanelCommand'
});


interface SwitchExamplePanelCommandAction extends BasicAction {
    type: 'SwitchExamplePanelCommand'
}

export const switchExamplePanelCommand = (): SwitchExamplePanelCommandAction => ({
    type: 'SwitchExamplePanelCommand'
});


interface SwitchShowEventPayloadCommandAction extends BasicAction {
    type: 'SwitchShowEventPayloadCommand'
}

export const switchShowEventPayloadCommand = (): SwitchShowEventPayloadCommandAction => ({
    type: 'SwitchShowEventPayloadCommand'
});


interface SwitchShowStructuredDataExplorerAttributesCommandAction extends BasicAction {
    type: 'SwitchShowStructuredDataExplorerAttributesCommand'
}

export const switchShowStructuredDataExplorerAttributesCommand = (): SwitchShowStructuredDataExplorerAttributesCommandAction => ({
    type: 'SwitchShowStructuredDataExplorerAttributesCommand'
});


interface SwitchPollForYetUnseenEventsCommandAction extends BasicAction {
    type: 'SwitchPollForYetUnseenEventsCommand'
}

export const switchPollForYetUnseenEventsCommand = (): SwitchPollForYetUnseenEventsCommandAction => ({
    type: 'SwitchPollForYetUnseenEventsCommand'
});


interface RetrieveYetUnseenEventsStartedEventAction extends BasicAction {
    type: 'RetrieveYetUnseenEventsStartedEvent'
}

const retrieveYetUnseenEventsStartedEvent = (): RetrieveYetUnseenEventsStartedEventAction => ({
    type: 'RetrieveYetUnseenEventsStartedEvent'
});


interface RetrieveYetUnseenEventsFailedEventAction extends ErrorAction {
    type: 'RetrieveYetUnseenEventsFailedEvent'
}

const retrieveYetUnseenEventsFailedEvent = (errorMessage: string): RetrieveYetUnseenEventsFailedEventAction => ({
    type: 'RetrieveYetUnseenEventsFailedEvent',
    errorMessage
});


interface RetrieveYetUnseenEventsSucceededEventAction extends BasicAction {
    type: 'RetrieveYetUnseenEventsSucceededEvent',
    yetUnseenEvents: Array<ServerEvent>
}

const retrieveYetUnseenEventsSucceededEvent = (yetUnseenEvents: Array<ServerEvent>): RetrieveYetUnseenEventsSucceededEventAction => ({
    type: 'RetrieveYetUnseenEventsSucceededEvent',
    yetUnseenEvents
});


export const retrieveYetUnseenEventsCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

    const repeat = () => {
        if (getState().activeServer.server.id !== null) {
            setTimeout(
                () => {
                    dispatch(retrieveYetUnseenEventsCommand());
                },
                2000
            );
        }
    }

    if (getState().activeServer.skipPollingForYetUnseenEvents) {
        repeat();
        return;
    }

    if (getState().activeServer.retrieveYetUnseenEventsOperation.isRunning) {
        console.warn(`A retrieveYetUnseenEventsCommand is already running, aborting.`);
        return;
    }

    dispatch(retrieveYetUnseenEventsStartedEvent());

    let responseWasOk = true;
    apiFetch(
        `/yet-unseen-server-events`,
        'GET',
        getState().session.webappApiKeyId,
        null,
        {
            serverId: getState().activeServer.server.id,
            latestSeenSortValue: getState().activeServer.server.latestEventSortValue,
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

        .then(responseContentAsArray => {
            if (!responseWasOk) {
                dispatch(retrieveYetUnseenEventsFailedEvent(responseContentAsArray));
            } else {
                dispatch(retrieveYetUnseenEventsSucceededEvent(responseContentAsArray));
                repeat();
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveYetUnseenEventsFailedEvent(error.toString()));
        });
};


interface ChangeCurrentEventsResultPageCommandAction extends BasicAction {
    type: 'ChangeCurrentEventsResultPageCommand',
    page: number
}

export const changeCurrentEventsResultPageCommand = (page: number): ChangeCurrentEventsResultPageCommandAction => ({
    type: 'ChangeCurrentEventsResultPageCommand',
    page
});


interface LoadEventIntoStructuredDataExplorerCommandAction extends BasicAction {
    type: 'LoadEventIntoStructuredDataExplorerCommand',
    event: ServerEvent
}

export const loadEventIntoStructuredDataExplorerCommand = (event: ServerEvent): LoadEventIntoStructuredDataExplorerCommandAction => ({
    type: 'LoadEventIntoStructuredDataExplorerCommand',
    event
});


interface CloseStructuredDataExplorerCommandAction extends BasicAction {
    type: 'CloseStructuredDataExplorerCommand'
}

export const closeStructuredDataExplorerCommand = (): CloseStructuredDataExplorerCommandAction => ({
    type: 'CloseStructuredDataExplorerCommand'
});


interface SelectActiveStructuredDataExplorerAttributeCommandAction extends BasicAction {
    type: 'SelectActiveStructuredDataExplorerAttributeCommand',
    byName: string,
    byVal: string
}

export const selectActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string): SelectActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'SelectActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});


interface AddActiveStructuredDataExplorerAttributeCommandAction extends BasicAction {
    type: 'AddActiveStructuredDataExplorerAttributeCommand',
    byName: string,
    byVal: string
}

export const addActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string): AddActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'AddActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});



export const removeActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string) => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {
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
                dispatch(retrieveYetUnseenEventsCommand());
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
                },

                logEventsPresentationMode: action.server.type === 'dayz'
                    ? LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                    : LOG_EVENTS_PRESENTATION_MODE_COMPACT,

                showEventPayload: action.server.type !== 'dayz',
            };
        }

        case 'CLOSE_ACTIVE_SERVER_COMMAND': {
            return initialState;
        }


        case 'CYCLE_LOG_EVENTS_PRESENTATION_MODE_COMMAND': {
            let newMode = LOG_EVENTS_PRESENTATION_MODE_DEFAULT;
            if (state.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT) {
                newMode = LOG_EVENTS_PRESENTATION_MODE_COMPACT;
            }
            return {
                ...state,
                logEventsPresentationMode: newMode
            };
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


        case 'SWITCH_POLL_FOR_YET_UNSEEN_EVENTS_COMMAND': {
            return {
                ...state,
                pollForYetUnseenEvents: !state.pollForYetUnseenEvents
            };
        }

        case 'SWITCH_SKIP_POLLING_FOR_YET_UNSEEN_EVENTS': {
            return {
                ...state,
                skipPollingForYetUnseenEvents: !state.skipPollingForYetUnseenEvents
            };
        }

        case 'RETRIEVE_YET_UNSEEN_EVENTS_STARTED_EVENT': {
            return {
                ...state,
                retrieveYetUnseenEventsOperation: {
                    ...state.retrieveYetUnseenEventsOperation,
                    isRunning: true,
                    justFinishedSuccessfully: false,
                    errorMessage: null
                }
            };
        }

        case 'RETRIEVE_YET_UNSEEN_EVENTS_FAILED_EVENT': {
            return {
                ...state,
                retrieveYetUnseenEventsOperation: {
                    ...state.retrieveYetUnseenEventsOperation,
                    isRunning: false,
                    justFinishedSuccessfully: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RETRIEVE_YET_UNSEEN_EVENTS_SUCCEEDED_EVENT': {
            if (action.yetUnseenEvents.length > 0) {
                return {
                    ...state,
                    server: {
                        ...state.server,
                        events: action.yetUnseenEvents.concat(state.server.events).slice(0, 10000),
                        latestEventSortValue: action.yetUnseenEvents[0].sortValue
                    },
                    retrieveYetUnseenEventsOperation: {
                        ...state.retrieveYetUnseenEventsOperation,
                        isRunning: false,
                        justFinishedSuccessfully: true,
                        errorMessage: null
                    }
                };
            } else {
                return {
                    ...state,
                    retrieveYetUnseenEventsOperation: {
                        ...state.retrieveYetUnseenEventsOperation,
                        isRunning: false,
                        justFinishedSuccessfully: true,
                        errorMessage: null
                    }
                };
            }
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
