// @ts-ignore
import { DatetimeHelper } from 'herodot-shared';
import { apiFetch } from '../util';
import { IServerEvent } from './servers';
import { IBasicAction, IErrorAction, IOperation, IReduxState } from './root';
import { ThunkDispatch } from 'redux-thunk';
import { ILogOutOfAccountSucceededEventAction } from './session';

export const LOG_EVENTS_PRESENTATION_MODE_DEFAULT = 0;
export const LOG_EVENTS_PRESENTATION_MODE_COMPACT = 1;

export type TLogEventsPresentationMode = 0 | 1;

export interface IServer {
    readonly id: null | string,
    readonly type: null | string,
    readonly title: null | string,
    readonly userId: null | string,
    readonly apiKeyId: null | string,
    readonly events: Array<IServerEvent>,
    readonly structuredDataExplorerEvents: Array<IServerEvent>,
    readonly latestEventSortValue: null | string,
    readonly numberOfEventsPerHour: Array<number>
}

export interface IActiveServerState {
    readonly server: IServer,
    readonly logEventsPresentationMode: TLogEventsPresentationMode,
    readonly pollForYetUnseenEvents: boolean,
    readonly showEventPayload: boolean,
    readonly showStructuredDataExplorerAttributes: boolean,
    readonly informationPanelIsOpen: boolean,
    readonly examplePanelIsOpen: boolean,
    readonly currentEventsResultPage: number,
    readonly retrieveEventsOperation: IOperation,
    readonly retrieveYetUnseenEventsOperation: IOperation,
    readonly retrieveNumberOfEventsPerHourOperation: IOperation,
    readonly retrieveStructuredDataExplorerEventsOperation: IOperation,
    readonly eventLoadedInStructuredDataExplorer: null | IServerEvent,
    readonly activeStructuredDataExplorerAttributes: Array<any>,
    readonly selectedTimelineIntervalStart: Date,
    readonly selectedTimelineIntervalEnd: Date,
    readonly timelineIntervalStart: Date,
    readonly timelineIntervalEnd: Date
}

export const initialState: IActiveServerState = {
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


export const makeServerActiveCommand = (server: IServer) => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>) => {
    dispatch(madeServerActiveEvent(server));
};


interface IMadeServerActiveEventAction extends IBasicAction {
    readonly type: 'MadeServerActiveCommand'
    readonly server: IServer
}

export const madeServerActiveEvent = (server: IServer): IMadeServerActiveEventAction => ({
    type: 'MadeServerActiveCommand',
    server
});


interface ICloseActiveServerCommandAction extends IBasicAction {
    readonly type: 'CloseActiveServerCommand'
}

export const closeActiveServerCommand = (): ICloseActiveServerCommandAction => ({
    type: 'CloseActiveServerCommand'
});


interface ICycleLogEventsPresentationModeCommandAction extends IBasicAction {
    readonly type: 'CycleLogEventsPresentationModeCommand'
}

export const cycleLogEventsPresentationModeCommand = (): ICycleLogEventsPresentationModeCommandAction => ({
    type: 'CycleLogEventsPresentationModeCommand'
});


interface ISwitchInformationPanelCommandAction extends IBasicAction {
    readonly type: 'SwitchInformationPanelCommand'
}

export const switchInformationPanelCommand = (): ISwitchInformationPanelCommandAction => ({
    type: 'SwitchInformationPanelCommand'
});


interface ISwitchExamplePanelCommandAction extends IBasicAction {
    readonly type: 'SwitchExamplePanelCommand'
}

export const switchExamplePanelCommand = (): ISwitchExamplePanelCommandAction => ({
    type: 'SwitchExamplePanelCommand'
});


interface ISwitchShowEventPayloadCommandAction extends IBasicAction {
    readonly type: 'SwitchShowEventPayloadCommand'
}

export const switchShowEventPayloadCommand = (): ISwitchShowEventPayloadCommandAction => ({
    type: 'SwitchShowEventPayloadCommand'
});


interface ISwitchShowStructuredDataExplorerAttributesCommandAction extends IBasicAction {
    readonly type: 'SwitchShowStructuredDataExplorerAttributesCommand'
}

export const switchShowStructuredDataExplorerAttributesCommand = (): ISwitchShowStructuredDataExplorerAttributesCommandAction => ({
    type: 'SwitchShowStructuredDataExplorerAttributesCommand'
});


interface ISwitchPollForYetUnseenEventsCommandAction extends IBasicAction {
    readonly type: 'SwitchPollForYetUnseenEventsCommand'
}

export const switchPollForYetUnseenEventsCommand = (): ISwitchPollForYetUnseenEventsCommandAction => ({
    type: 'SwitchPollForYetUnseenEventsCommand'
});


interface IRetrieveYetUnseenEventsStartedEventAction extends IBasicAction {
    readonly type: 'RetrieveYetUnseenEventsStartedEvent'
}

const retrieveYetUnseenEventsStartedEvent = (): IRetrieveYetUnseenEventsStartedEventAction => ({
    type: 'RetrieveYetUnseenEventsStartedEvent'
});


interface IRetrieveYetUnseenEventsFailedEventAction extends IErrorAction {
    readonly type: 'RetrieveYetUnseenEventsFailedEvent'
}

const retrieveYetUnseenEventsFailedEvent = (errorMessage: string): IRetrieveYetUnseenEventsFailedEventAction => ({
    type: 'RetrieveYetUnseenEventsFailedEvent',
    errorMessage
});


interface IRetrieveYetUnseenEventsSucceededEventAction extends IBasicAction {
    readonly type: 'RetrieveYetUnseenEventsSucceededEvent',
    readonly yetUnseenEvents: Array<IServerEvent>
}

const retrieveYetUnseenEventsSucceededEvent = (yetUnseenEvents: Array<IServerEvent>): IRetrieveYetUnseenEventsSucceededEventAction => ({
    type: 'RetrieveYetUnseenEventsSucceededEvent',
    yetUnseenEvents
});


export const retrieveYetUnseenEventsCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

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
            serverId: `${getState().activeServer.server.id}`,
            latestSeenSortValue: `${getState().activeServer.server.latestEventSortValue}`,
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


interface IChangeCurrentEventsResultPageCommandAction extends IBasicAction {
    readonly type: 'ChangeCurrentEventsResultPageCommand',
    readonly page: number
}

export const changeCurrentEventsResultPageCommand = (page: number): IChangeCurrentEventsResultPageCommandAction => ({
    type: 'ChangeCurrentEventsResultPageCommand',
    page
});


interface ILoadEventIntoStructuredDataExplorerCommandAction extends IBasicAction {
    readonly type: 'LoadEventIntoStructuredDataExplorerCommand',
    readonly event: IServerEvent
}

export const loadEventIntoStructuredDataExplorerCommand = (event: IServerEvent): ILoadEventIntoStructuredDataExplorerCommandAction => ({
    type: 'LoadEventIntoStructuredDataExplorerCommand',
    event
});


interface ICloseStructuredDataExplorerCommandAction extends IBasicAction {
    readonly type: 'CloseStructuredDataExplorerCommand'
}

export const closeStructuredDataExplorerCommand = (): ICloseStructuredDataExplorerCommandAction => ({
    type: 'CloseStructuredDataExplorerCommand'
});


interface ISelectActiveStructuredDataExplorerAttributeCommandAction extends IBasicAction {
    readonly type: 'SelectActiveStructuredDataExplorerAttributeCommand',
    readonly byName: string,
    readonly byVal: string
}

export const selectActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string): ISelectActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'SelectActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});


interface IAddActiveStructuredDataExplorerAttributeCommandAction extends IBasicAction {
    readonly type: 'AddActiveStructuredDataExplorerAttributeCommand',
    readonly byName: string,
    readonly byVal: string
}

export const addActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string): IAddActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'AddActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});



export const removeActiveStructuredDataExplorerAttributeCommand = (byName: string, byVal: string) => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {
    dispatch(removedActiveStructuredDataExplorerAttributeEvent(byName, byVal));
    if (getState().activeServer.activeStructuredDataExplorerAttributes.length === 0) {
        dispatch(resetStructuredDataExplorerEventsCommand());
    } else {
        dispatch(retrieveStructuredDataExplorerEventsCommand());
    }
};


interface IRemovedActiveStructuredDataExplorerAttributeCommandAction extends IBasicAction {
    readonly type: 'RemovedActiveStructuredDataExplorerAttributeCommand',
    readonly byName: string,
    readonly byVal: string
}

const removedActiveStructuredDataExplorerAttributeEvent = (byName: string, byVal: string): IRemovedActiveStructuredDataExplorerAttributeCommandAction => ({
    type: 'RemovedActiveStructuredDataExplorerAttributeCommand',
    byName,
    byVal
});


interface IRetrieveStructuredDataExplorerEventsStartedEventAction extends IBasicAction {
    readonly type: 'RetrieveStructuredDataExplorerEventsStartedEvent'
}

const retrieveStructuredDataExplorerEventsStartedEvent = (): IRetrieveStructuredDataExplorerEventsStartedEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsStartedEvent'
});


interface IRetrieveStructuredDataExplorerEventsFailedEventAction extends IErrorAction {
    readonly type: 'RetrieveStructuredDataExplorerEventsFailedEvent'
}

const retrieveStructuredDataExplorerEventsFailedEvent = (errorMessage: string): IRetrieveStructuredDataExplorerEventsFailedEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsFailedEvent',
    errorMessage
});


interface IRetrieveStructuredDataExplorerEventsSucceededEventAction extends IBasicAction {
    readonly type: 'RetrieveStructuredDataExplorerEventsSucceededEvent',
    readonly events: Array<IServerEvent>
}

const retrieveStructuredDataExplorerEventsSucceededEvent = (events: Array<IServerEvent>): IRetrieveStructuredDataExplorerEventsSucceededEventAction => ({
    type: 'RetrieveStructuredDataExplorerEventsSucceededEvent',
    events
});


interface IResetStructuredDataExplorerEventsCommandAction extends IBasicAction {
    readonly type: 'ResetStructuredDataExplorerEventsCommand'
}

export const resetStructuredDataExplorerEventsCommand = (): IResetStructuredDataExplorerEventsCommandAction => ({
    type: 'ResetStructuredDataExplorerEventsCommand'
});


export const retrieveStructuredDataExplorerEventsCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

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


interface IRetrieveEventsStartedEventAction extends IBasicAction {
    readonly type: 'RetrieveEventsStartedEvent'
}

export const retrieveEventsStartedEvent = (): IRetrieveEventsStartedEventAction => ({
    type: 'RetrieveEventsStartedEvent'
});


interface IRetrieveEventsFailedEventAction extends IErrorAction {
    readonly type: 'RetrieveEventsFailedEvent'
}

export const retrieveEventsFailedEvent = (errorMessage: string): IRetrieveEventsFailedEventAction => ({
    type: 'RetrieveEventsFailedEvent',
    errorMessage
});


interface IRetrieveEventsSucceededEventAction extends IBasicAction {
    readonly type: 'RetrieveEventsSucceededEvent',
    readonly events: Array<IServerEvent>
}

const retrieveEventsSucceededEvent = (events: Array<IServerEvent>): IRetrieveEventsSucceededEventAction => ({
    type: 'RetrieveEventsSucceededEvent',
    events
});

export const retrieveEventsCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

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


interface IRetrieveNumberOfEventsPerHourStartedEventAction extends IBasicAction {
    readonly type: 'RetrieveNumberOfEventsPerHourStartedEvent'
}

export const retrieveNumberOfEventsPerHourStartedEvent = (): IRetrieveNumberOfEventsPerHourStartedEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourStartedEvent'
});


interface IRetrieveNumberOfEventsPerHourFailedEventAction extends IErrorAction {
    readonly type: 'RetrieveNumberOfEventsPerHourFailedEvent'
}

export const retrieveNumberOfEventsPerHourFailedEvent = (errorMessage: string): IRetrieveNumberOfEventsPerHourFailedEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourFailedEvent',
    errorMessage
});


interface IRetrieveNumberOfEventsPerHourSucceededEventAction extends IBasicAction {
    readonly type: 'RetrieveNumberOfEventsPerHourSucceededEvent',
    readonly numberOfEventsPerHour: Array<number>
}

const retrieveNumberOfEventsPerHourSucceededEvent = (numberOfEventsPerHour: Array<number>): IRetrieveNumberOfEventsPerHourSucceededEventAction => ({
    type: 'RetrieveNumberOfEventsPerHourSucceededEvent',
    numberOfEventsPerHour
});

export const retrieveNumberOfEventsPerHourCommand = () => (dispatch: ThunkDispatch<IReduxState, void, IBasicAction>, getState: () => IReduxState) => {

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


interface ISelectedTimelineIntervalsUpdatedEventAction extends IBasicAction {
    readonly type: 'SelectedTimelineIntervalsUpdatedEvent',
    readonly selectedTimelineIntervalStart: Date,
    readonly selectedTimelineIntervalEnd: Date,
}

export const selectedTimelineIntervalsUpdatedEvent = (selectedTimelineIntervalStart: Date, selectedTimelineIntervalEnd: Date): ISelectedTimelineIntervalsUpdatedEventAction => ({
    type: 'SelectedTimelineIntervalsUpdatedEvent',
    selectedTimelineIntervalStart,
    selectedTimelineIntervalEnd
})


export type TActiveServerAction =
    | IMadeServerActiveEventAction
    | ICloseActiveServerCommandAction

    | IAddActiveStructuredDataExplorerAttributeCommandAction
    | ISelectActiveStructuredDataExplorerAttributeCommandAction
    | IRemovedActiveStructuredDataExplorerAttributeCommandAction

    | IChangeCurrentEventsResultPageCommandAction

    | ILoadEventIntoStructuredDataExplorerCommandAction
    | IResetStructuredDataExplorerEventsCommandAction
    | ICloseStructuredDataExplorerCommandAction

    | IRetrieveEventsStartedEventAction
    | IRetrieveEventsFailedEventAction
    | IRetrieveEventsSucceededEventAction

    | IRetrieveNumberOfEventsPerHourStartedEventAction
    | IRetrieveNumberOfEventsPerHourFailedEventAction
    | IRetrieveNumberOfEventsPerHourSucceededEventAction

    | IRetrieveYetUnseenEventsStartedEventAction
    | IRetrieveYetUnseenEventsFailedEventAction
    | IRetrieveYetUnseenEventsSucceededEventAction

    | IRetrieveStructuredDataExplorerEventsStartedEventAction
    | IRetrieveStructuredDataExplorerEventsFailedEventAction
    | IRetrieveStructuredDataExplorerEventsSucceededEventAction

    | ISelectedTimelineIntervalsUpdatedEventAction

    | ICycleLogEventsPresentationModeCommandAction

    | ISwitchExamplePanelCommandAction
    | ISwitchInformationPanelCommandAction

    | ISwitchPollForYetUnseenEventsCommandAction

    | ISwitchShowEventPayloadCommandAction
    | ISwitchShowStructuredDataExplorerAttributesCommandAction;


const reducer = (state: IActiveServerState = initialState, action: TActiveServerAction | ILogOutOfAccountSucceededEventAction): IActiveServerState => {

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
            let newMode: TLogEventsPresentationMode = LOG_EVENTS_PRESENTATION_MODE_DEFAULT;
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
