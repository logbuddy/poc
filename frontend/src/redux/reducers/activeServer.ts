// @ts-ignore
import { DatetimeHelper } from 'herodot-shared';
import { apiFetch } from '../util';
import { ServerEvent } from './servers';
import { BasicAction, ErrorAction, Operation, ReduxState } from './root';
import { ThunkDispatch } from 'redux-thunk';
import {LogOutOfAccountSucceededEventAction} from "./session";

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
    showEventPayload: boolean,
    showStructuredDataExplorerAttributes: boolean,
    informationPanelIsOpen: boolean,
    examplePanelIsOpen: boolean,
    currentEventsResultPage: number,
    retrieveEventsOperation: Operation,
    retrieveYetUnseenEventsOperation: Operation,
    retrieveNumberOfEventsPerHourOperation: Operation,
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
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveNumberOfEventsPerHourOperation: {
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


interface RemovedActiveStructuredDataExplorerAttributeCommandAction extends BasicAction {
    type: 'RemovedActiveStructuredDataExplorerAttributeCommand',
    byName: string,
    byVal: string
}

const removedActiveStructuredDataExplorerAttributeEvent = (byName: string, byVal: string): RemovedActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'RemovedActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});


interface RetrieveStructuredDataExplorerEventsStartedEventAction extends BasicAction {
    type: 'RetrieveStructuredDataExplorerEventsStartedEvent'
}

const retrieveStructuredDataExplorerEventsStartedEvent = (): RetrieveStructuredDataExplorerEventsStartedEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsStartedEvent'
});


interface RetrieveStructuredDataExplorerEventsFailedEventAction extends ErrorAction {
    type: 'RetrieveStructuredDataExplorerEventsFailedEvent'
}

const retrieveStructuredDataExplorerEventsFailedEvent = (errorMessage: string): RetrieveStructuredDataExplorerEventsFailedEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsFailedEvent',
    errorMessage
});


interface RetrieveStructuredDataExplorerEventsSucceededEventAction extends BasicAction {
    type: 'RetrieveStructuredDataExplorerEventsSucceededEvent',
    events: Array<ServerEvent>
}

const retrieveStructuredDataExplorerEventsSucceededEvent = (events: Array<ServerEvent>): RetrieveStructuredDataExplorerEventsSucceededEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsSucceededEvent',
    events
});


interface ResetStructuredDataExplorerEventsCommandAction extends BasicAction {
    type: 'ResetStructuredDataExplorerEventsCommand'
}

export const resetStructuredDataExplorerEventsCommand = (): ResetStructuredDataExplorerEventsCommandAction => ({
    type: 'ResetStructuredDataExplorerEventsCommand'
});


export const retrieveStructuredDataExplorerEventsCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

    if (getState().activeServer.activeStructuredDataExplorerAttributes.length === 0) {
        console.error('Was asked to retrieve Structured Data Explorer events, but no attributes are set.');
        return;
    }

    dispatch(retrieveStructuredDataExplorerEventsStartedEvent());

    const queryParams: any = {
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


interface RetrieveEventsStartedEventAction extends BasicAction {
    type: 'RetrieveEventsStartedEvent'
}

export const retrieveEventsStartedEvent = (): RetrieveEventsStartedEventAction => ({
    type: 'RetrieveEventsStartedEvent'
});


interface RetrieveEventsFailedEventAction extends ErrorAction {
    type: 'RetrieveEventsFailedEvent'
}

export const retrieveEventsFailedEvent = (errorMessage: string): RetrieveEventsFailedEventAction => ({
    type: 'RetrieveEventsFailedEvent',
    errorMessage
});


interface RetrieveEventsSucceededEventAction extends BasicAction {
    type: 'RetrieveEventsSucceededEvent',
    events: Array<ServerEvent>
}

const retrieveEventsSucceededEvent = (events: Array<ServerEvent>): RetrieveEventsSucceededEventAction => ({
    type: 'RetrieveEventsSucceededEvent',
    events
});

export const retrieveEventsCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

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


interface RetrieveNumberOfEventsPerHourStartedEventAction extends BasicAction {
    type: 'RetrieveNumberOfEventsPerHourStartedEvent'
}

export const retrieveNumberOfEventsPerHourStartedEvent = (): RetrieveNumberOfEventsPerHourStartedEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourStartedEvent'
});


interface RetrieveNumberOfEventsPerHourFailedEventAction extends ErrorAction {
    type: 'RetrieveNumberOfEventsPerHourFailedEvent'
}

export const retrieveNumberOfEventsPerHourFailedEvent = (errorMessage: string): RetrieveNumberOfEventsPerHourFailedEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourFailedEvent',
    errorMessage
});


interface RetrieveNumberOfEventsPerHourSucceededEventAction extends BasicAction {
    type: 'RetrieveNumberOfEventsPerHourSucceededEvent',
    numberOfEventsPerHour: Array<number>
}

const retrieveNumberOfEventsPerHourSucceededEvent = (numberOfEventsPerHour: Array<number>): RetrieveNumberOfEventsPerHourSucceededEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourSucceededEvent',
    numberOfEventsPerHour
});

export const retrieveNumberOfEventsPerHourCommand = () => (dispatch: ThunkDispatch<ReduxState, void, BasicAction>, getState: () => ReduxState) => {

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


interface SelectedTimelineIntervalsUpdatedEventAction extends BasicAction {
    type: 'SelectedTimelineIntervalsUpdatedEvent',
    selectedTimelineIntervalStart: Date,
    selectedTimelineIntervalEnd: Date,
}

export const selectedTimelineIntervalsUpdatedEvent = (selectedTimelineIntervalStart: Date, selectedTimelineIntervalEnd: Date): SelectedTimelineIntervalsUpdatedEventAction => ({
    type: 'SelectedTimelineIntervalsUpdatedEvent',
    selectedTimelineIntervalStart,
    selectedTimelineIntervalEnd
})


export type ActiveServerAction =
    | MadeServerActiveEventAction
    | CloseActiveServerCommandAction

    | AddActiveStructuredDataExplorerAttributeCommandAction
    | SelectActiveStructuredDataExplorerAttributeCommandAction
    | RemovedActiveStructuredDataExplorerAttributeCommandAction

    | ChangeCurrentEventsResultPageCommandAction

    | LoadEventIntoStructuredDataExplorerCommandAction
    | ResetStructuredDataExplorerEventsCommandAction
    | CloseStructuredDataExplorerCommandAction

    | RetrieveEventsStartedEventAction
    | RetrieveEventsFailedEventAction
    | RetrieveEventsSucceededEventAction

    | RetrieveNumberOfEventsPerHourStartedEventAction
    | RetrieveNumberOfEventsPerHourFailedEventAction
    | RetrieveNumberOfEventsPerHourSucceededEventAction

    | RetrieveYetUnseenEventsStartedEventAction
    | RetrieveYetUnseenEventsFailedEventAction
    | RetrieveYetUnseenEventsSucceededEventAction

    | RetrieveStructuredDataExplorerEventsStartedEventAction
    | RetrieveStructuredDataExplorerEventsFailedEventAction
    | RetrieveStructuredDataExplorerEventsSucceededEventAction

    | SelectedTimelineIntervalsUpdatedEventAction

    | CycleLogEventsPresentationModeCommandAction

    | SwitchExamplePanelCommandAction
    | SwitchInformationPanelCommandAction

    | SwitchPollForYetUnseenEventsCommandAction

    | SwitchShowEventPayloadCommandAction
    | SwitchShowStructuredDataExplorerAttributesCommandAction;


const reducer = (state: ActiveServerState = initialState, action: ActiveServerAction | LogOutOfAccountSucceededEventAction): ActiveServerState => {

    switch (action.type) {

        case 'MadeServerActiveCommand': {
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

        case 'CloseActiveServerCommand': {
            return initialState;
        }


        case 'CycleLogEventsPresentationModeCommand': {
            let newMode: 0 | 1 = LOG_EVENTS_PRESENTATION_MODE_DEFAULT;
            if (state.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT) {
                newMode = LOG_EVENTS_PRESENTATION_MODE_COMPACT;
            }
            return {
                ...state,
                logEventsPresentationMode: newMode
            };
        }


        case 'SwitchInformationPanelCommand': {
            return {
                ...state,
                informationPanelIsOpen: !state.informationPanelIsOpen
            };
        }


        case 'SwitchExamplePanelCommand': {
            return {
                ...state,
                examplePanelIsOpen: !state.examplePanelIsOpen
            };
        }


        case 'SwitchShowEventPayloadCommand': {
            return {
                ...state,
                showEventPayload: !state.showEventPayload
            };
        }


        case 'SwitchShowStructuredDataExplorerAttributesCommand': {
            return {
                ...state,
                showStructuredDataExplorerAttributes: !state.showStructuredDataExplorerAttributes
            };
        }


        case 'SwitchPollForYetUnseenEventsCommand': {
            return {
                ...state,
                pollForYetUnseenEvents: !state.pollForYetUnseenEvents
            };
        }

        case 'RetrieveYetUnseenEventsStartedEvent': {
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

        case 'RetrieveYetUnseenEventsFailedEvent': {
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

        case 'RetrieveYetUnseenEventsSucceededEvent': {
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

        case 'ChangeCurrentEventsResultPageCommand': {
            return {
                ...state,
                currentEventsResultPage: action.page
            };
        }


        case 'LoadEventIntoStructuredDataExplorerCommand': {
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


        case 'CloseStructuredDataExplorerCommand': {
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


        case 'SelectActiveStructuredDataExplorerAttributeCommand': {
            return {
                ...state,
                activeStructuredDataExplorerAttributes: [{ byName: action.byName, byVal: action.byVal }]
            };
        }

        case 'AddActiveStructuredDataExplorerAttributeCommand': {
            return {
                ...state,
                activeStructuredDataExplorerAttributes: [
                    ...state.activeStructuredDataExplorerAttributes,
                    { byName: action.byName, byVal: action.byVal }
                ]
            };
        }


        case 'RemovedActiveStructuredDataExplorerAttributeCommand': {
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


        case 'RetrieveStructuredDataExplorerEventsStartedEvent': {
            return {
                ...state,
                retrieveStructuredDataExplorerEventsOperation: {
                    ...state.retrieveStructuredDataExplorerEventsOperation,
                    isRunning: true
                }
            };
        }

        case 'RetrieveStructuredDataExplorerEventsFailedEvent': {
            return {
                ...state,
                retrieveStructuredDataExplorerEventsOperation: {
                    ...state.retrieveStructuredDataExplorerEventsOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RetrieveStructuredDataExplorerEventsSucceededEvent': {
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


        case 'RetrieveEventsStartedEvent': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: true
                },
                currentEventsResultPage: 1
            };
        }

        case 'RetrieveEventsFailedEvent': {
            return {
                ...state,
                retrieveEventsOperation: {
                    ...state.retrieveEventsOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RetrieveEventsSucceededEvent': {
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


        case 'RetrieveNumberOfEventsPerHourStartedEvent': {
            return {
                ...state,
                retrieveNumberOfEventsPerHourOperation: {
                    ...state.retrieveNumberOfEventsPerHourOperation,
                    isRunning: true
                }
            };
        }

        case 'RetrieveNumberOfEventsPerHourFailedEvent': {
            return {
                ...state,
                retrieveNumberOfEventsPerHourOperation: {
                    ...state.retrieveNumberOfEventsPerHourOperation,
                    isRunning: false,
                    errorMessage: action.errorMessage
                }
            };
        }

        case 'RetrieveNumberOfEventsPerHourSucceededEvent': {
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


        case 'SelectedTimelineIntervalsUpdatedEvent': {
            return {
                ...state,
                selectedTimelineIntervalStart: action.selectedTimelineIntervalStart,
                selectedTimelineIntervalEnd: action.selectedTimelineIntervalEnd
            };
        }


        case 'LogOutOfAccountSucceededEvent': {
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
