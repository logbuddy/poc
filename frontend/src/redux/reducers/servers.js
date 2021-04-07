import { endOfToday, subDays, set } from 'date-fns';
import { apiFetch } from '../util';
import DatetimeHelper from '../../DatetimeHelper.mjs';

const initialState = {
    showEventPayload: true,
    retrieveServerListOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning: [],
    serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped: [],
    serverIdsForWhichRetrieveServerEventsByOperationIsRunning: [],
    createServerOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    serverList: [],
    serverListOpenElements: {
        information: [],
        sampleCurlCommand: [],
        latestEvents: []
    },
    serverListLatestEventsOpenForServerId: null,
    selectedTimelineIntervalStart: set(subDays(new Date(), 1), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
    selectedTimelineIntervalEnd: endOfToday(),
    activeStructuredDataExplorerAttributesByServerId: {}
};


export const disableShowEventPayloadCommand = () => ({
    type: 'DISABLE_SHOW_EVENT_PAYLOAD_COMMAND'
});

export const enableShowEventPayloadCommand = () => ({
    type: 'ENABLE_SHOW_EVENT_PAYLOAD_COMMAND'
});

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
        getState().session.webappApiKeyId,
        null,
        {
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalEnd)
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
                dispatch(retrieveServerListSucceededEvent(responseContentAsObject));
                for (let i=0; i < getState().servers.serverListOpenElements.latestEvents.length; i++) {
                    console.debug('starting polling', getState().servers.serverList);
                    let latestEventSortValue = null;
                    for (let j=0; j < getState().servers.serverList.length; j++) {
                        if (getState().servers.serverList[j].id === getState().servers.serverListOpenElements.latestEvents[i]) {
                            latestEventSortValue = getState().servers.serverList[j].latestEventSortValue;
                        }
                    }
                }
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServerListFailedEvent(error.toString()));
        });
};


const retrieveYetUnseenServerEventsStartedEvent = (serverId) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_STARTED_EVENT',
    serverId
});

const retrieveYetUnseenServerEventsFailedEvent = (serverId, errorMessage) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_FAILED_EVENT',
    serverId,
    errorMessage
});

const retrieveYetUnseenServerEventsSucceededEvent = (serverId, yetUnseenServerEvents) => ({
    type: 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_SUCCEEDED_EVENT',
    serverId,
    yetUnseenServerEvents
});

export const retrieveYetUnseenServerEventsCommand = (serverId, latestSeenSortValue) => (dispatch, getState) => {

    const repeat = () => {
        if (getState().servers.serverListOpenElements.latestEvents.includes(serverId)) {
            setTimeout(() => {
                const serverList = getState().servers.serverList;
                for (let i = 0; i < serverList.length; i++) {
                    if (serverList[i].id === serverId) {
                        dispatch(retrieveYetUnseenServerEventsCommand(serverId, serverList[i].latestEventSortValue));
                    }
                }
            }, 2000);
        }
    }

    if (getState().servers.serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped.includes(serverId)) {
        repeat();
        return;
    }

    if (getState().servers.serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning.includes(serverId)) {
        console.warn(`A retrieveYetUnseenServerEventsCommand for serverId ${serverId} is already running, aborting.`);
        return;
    }

    dispatch(retrieveYetUnseenServerEventsStartedEvent(serverId));

    let responseWasOk = true;
    apiFetch(
        '/yet-unseen-server-events',
        'GET',
        getState().session.webappApiKeyId,
        null,
        {
            serverId,
            latestSeenSortValue,
            selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalStart),
            selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalEnd)
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
                dispatch(retrieveYetUnseenServerEventsFailedEvent(serverId, responseContentAsArray));
            } else {
                dispatch(retrieveYetUnseenServerEventsSucceededEvent(serverId, responseContentAsArray));
                repeat();
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveYetUnseenServerEventsFailedEvent(serverId, error.toString()));
        });
};


const retrieveServerEventsByStartedEvent = (serverId) => ({
    type: 'RETRIEVE_SERVER_EVENTS_BY_STARTED_EVENT',
    serverId
});

const retrieveServerEventsByFailedEvent = (serverId, errorMessage) => ({
    type: 'RETRIEVE_SERVER_EVENTS_BY_FAILED_EVENT',
    serverId,
    errorMessage
});

const retrieveServerEventsBySucceededEvent = (serverId, serverEvents) => ({
    type: 'RETRIEVE_SERVER_EVENTS_BY_SUCCEEDED_EVENT',
    serverId,
    serverEvents
});

export const resetServerEventsByCommand = () => ({
    type: 'RESET_SERVER_EVENTS_BY_COMMAND'
});

export const retrieveServerEventsByCommand = (serverId) => (dispatch, getState) => {

    if (!getState().servers.activeStructuredDataExplorerAttributesByServerId.hasOwnProperty(serverId)) {
        console.error(`Was asked to retrieve "by" events for server id ${serverId} which has no "by" attributes set.`);
        return;
    }

    dispatch(retrieveServerEventsByStartedEvent(serverId));

    const queryParams = {
        serverId,
        selectedTimelineIntervalStart: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalStart),
        selectedTimelineIntervalEnd: DatetimeHelper.dateObjectToUTCDatetimeString(getState().servers.selectedTimelineIntervalEnd)
    };

    let i = 0;
    const attributes = getState().servers.activeStructuredDataExplorerAttributesByServerId[serverId];
    console.debug(attributes);
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
                dispatch(retrieveServerEventsByFailedEvent(serverId, responseContentAsArray));
            } else {
                dispatch(retrieveServerEventsBySucceededEvent(serverId, responseContentAsArray));
            }
        })

        .catch(function(error) {
            console.error(error)
            dispatch(retrieveServerEventsByFailedEvent(serverId, error.toString()));
        });
};


export const enableSkipRetrieveYetUnseenServerEventsOperationsCommand = (serverId) => ({
    type: 'ENABLE_SKIP_RETRIEVE_YET_UNSEEN_SERVER_EVENTS_OPERATIONS_COMMAND',
    serverId
});

export const disableSkipRetrieveYetUnseenServerEventsOperationsCommand = (serverId) => ({
    type: 'DISABLE_SKIP_RETRIEVE_YET_UNSEEN_SERVER_EVENTS_OPERATIONS_COMMAND',
    serverId
});


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


export const flipServerListElementOpenCommand = (serverId, elementName) => ({
    type: 'FLIPPED_SERVER_LIST_ELEMENT_OPEN_EVENT',
    serverId,
    elementName
});

export const flipServerListElementCloseCommand = (serverId, elementName) => ({
    type: 'FLIPPED_SERVER_LIST_ELEMENT_CLOSE_EVENT',
    serverId,
    elementName
});


export const timelineIntervalsUpdatedEvent = (timelineIntervalStart, timelineIntervalEnd) => ({
    type: 'TIMELINE_INTERVALS_UPDATED_EVENT',
    timelineIntervalStart,
    timelineIntervalEnd
})

export const timelineIntervalsChangedEvent = () => (dispatch, getState) => {
    dispatch(retrieveServerListCommand());
    for (let serverId in getState().servers.activeStructuredDataExplorerAttributesByServerId) {
        if (getState().servers.activeStructuredDataExplorerAttributesByServerId[serverId].length > 0) {
            dispatch(retrieveServerEventsByCommand(serverId));
        }
    }
};


export const selectActiveStructuredDataExplorerAttributeCommand = (serverId, byName, byVal) => ({
    type: 'SELECT_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND',
    serverId,
    byName,
    byVal
});

export const addActiveStructuredDataExplorerAttributeCommand = (serverId, byName, byVal) => ({
    type: 'ADD_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND',
    serverId,
    byName,
    byVal
});

export const removeActiveStructuredDataExplorerAttributeCommand = (serverId, byName, byVal) => (dispatch, getState) => {
    dispatch(removedActiveStructuredDataExplorerAttributeEvent(serverId, byName, byVal));
    if (   getState().servers.activeStructuredDataExplorerAttributesByServerId.hasOwnProperty(serverId)
        && getState().servers.activeStructuredDataExplorerAttributesByServerId[serverId].length === 0
    ) {
        dispatch(resetServerEventsByCommand());
    } else {
        dispatch(retrieveServerEventsByCommand(serverId));
    }
};

const removedActiveStructuredDataExplorerAttributeEvent = (serverId, byName, byVal) => ({
    type: 'REMOVED_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_EVENT',
    serverId,
    byName,
    byVal
});

export const resetActiveStructuredDataExplorerAttributesCommand = (serverId) => ({
    type: 'RESET_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTES_COMMAND',
    serverId
});


const reducer = (state = initialState, action) => {

    const withYetUnseenServerEventsUpdatedServerList = (serverId, yetUnseenServerEvents) => {
        const serverList = [ ...state.serverList ];
        for (let i = 0; i < serverList.length; i++) {
            if (serverId === serverList[i].id) {
                serverList[i].latestEvents = yetUnseenServerEvents.concat(serverList[i].latestEvents).slice(0, 10000);
                serverList[i].latestEventSortValue = yetUnseenServerEvents[0].sortValue;
            }
        }
        return serverList;
    };

    const withServerEventsByUpdatedServerList = (serverId, serverEvents) => {
        const serverList = [ ...state.serverList ];
        for (let i = 0; i < serverList.length; i++) {
            if (serverId === serverList[i].id) {
                serverList[i].latestEventsBy = serverEvents
                    .filter(
                        serverEvent => (serverEvent.hasOwnProperty('id') && serverEvent.id !== null)
                    )
                    .slice(0, 999);
            }
        }
        return serverList;
    };

    const withEmptiedServerEventsByServerList = () => {
        const serverList = [ ...state.serverList ];
        for (let i = 0; i < serverList.length; i++) {
            serverList[i].latestEventsBy = [];
        }
        return serverList;
    };

    switch (action.type) {

        case 'DISABLE_SHOW_EVENT_PAYLOAD_COMMAND':
            return {
                ...state,
                showEventPayload: false,
            };

        case 'ENABLE_SHOW_EVENT_PAYLOAD_COMMAND':
            return {
                ...state,
                showEventPayload: true,
            };

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
            const serverListOpenElementsLatestEvents = [ ...state.serverListOpenElements.latestEvents ];
            return {
                ...state,
                retrieveServerListOperation: {
                    ...initialState.retrieveServerListOperation,
                    justFinishedSuccessfully: true
                },
                serverList: updateServerlist(state.serverList, action.serverList),
                serverListOpenElements: {
                    ...state.serverListOpenElements,
                    latestEvents: serverListOpenElementsLatestEvents
                }
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


        case 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_STARTED_EVENT':
            return {
                ...state,
                serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning: [
                    ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning,
                    action.serverId
                ]
            };

        case 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_FAILED_EVENT':
            return {
                ...state,
                serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning: [
                    ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning.filter(
                        serverId => serverId !== action.serverId
                    )
                ]
            };

        case 'RETRIEVE_YET_UNSEEN_SERVER_EVENTS_SUCCEEDED_EVENT':
            if (action.yetUnseenServerEvents.length > 0) {
                return {
                    ...state,
                    serverList: withYetUnseenServerEventsUpdatedServerList(action.serverId, action.yetUnseenServerEvents),
                    serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning: [
                        ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning.filter(
                            serverId => serverId !== action.serverId
                        )
                    ]
                };
            } else {
                return {
                    ...state,
                    serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning: [
                        ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationIsRunning.filter(
                            serverId => serverId !== action.serverId
                        )
                    ]
                };
            }


        case 'ENABLE_SKIP_RETRIEVE_YET_UNSEEN_SERVER_EVENTS_OPERATIONS_COMMAND':
            return {
                ...state,
                serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped: [
                    ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped, action.serverId
                ]
            };

        case 'DISABLE_SKIP_RETRIEVE_YET_UNSEEN_SERVER_EVENTS_OPERATIONS_COMMAND':
            return {
                ...state,
                serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped: [
                    ...state.serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped.filter(
                        serverId => serverId !== action.serverId
                    )
                ]
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
                serverListOpenElements: {
                    ...state.serverListOpenElements,
                    information: [
                        ...state.serverListOpenElements.information,
                        action.server.id
                    ],
                    sampleCurlCommand: [
                        ...state.serverListOpenElements.sampleCurlCommand,
                        action.server.id
                    ]
                }
            };

        case 'CREATE_SERVER_FAILED_EVENT':
            return {
                ...state,
                createServerOperation: {
                    ...initialState.createServerOperation,
                    errorMessage: action.errorMessage
                }
            };


        case 'FLIPPED_SERVER_LIST_ELEMENT_OPEN_EVENT':
            let updatedStateOpenEvent = { ...state.serverListOpenElements };
            if (action.elementName === 'information') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    information: [
                        ...updatedStateOpenEvent.information,
                        action.serverId
                    ]
                };
            }
            if (action.elementName === 'sampleCurlCommand') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    sampleCurlCommand: [
                        ...updatedStateOpenEvent.sampleCurlCommand,
                        action.serverId
                    ]
                };
            }
            if (action.elementName === 'latestEvents') {
                updatedStateOpenEvent = {
                    ...updatedStateOpenEvent,
                    latestEvents: [
                        ...updatedStateOpenEvent.latestEvents,
                        action.serverId
                    ]
                };
            }

            return {
                ...state,
                serverListOpenElements: updatedStateOpenEvent
            };

        case 'FLIPPED_SERVER_LIST_ELEMENT_CLOSE_EVENT':
            let updatedStateCloseEvent = { ...state.serverListOpenElements };
            if (action.elementName === 'information') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    information: updatedStateCloseEvent.information.filter(serverId => serverId !== action.serverId)
                };
            }
            if (action.elementName === 'sampleCurlCommand') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    sampleCurlCommand: updatedStateCloseEvent.sampleCurlCommand.filter(serverId => serverId !== action.serverId)
                };
            }
            if (action.elementName === 'latestEvents') {
                updatedStateCloseEvent = {
                    ...updatedStateCloseEvent,
                    latestEvents: updatedStateCloseEvent.latestEvents.filter(serverId => serverId !== action.serverId)
                };
            }

            return {
                ...state,
                serverListOpenElements: updatedStateCloseEvent
            };


        case 'RETRIEVE_SERVER_EVENTS_BY_STARTED_EVENT':
            return {
                ...state,
                serverIdsForWhichRetrieveServerEventsByOperationIsRunning: [
                    ...state.serverIdsForWhichRetrieveServerEventsByOperationIsRunning,
                    action.serverId
                ]
            }

        case 'RETRIEVE_SERVER_EVENTS_BY_FAILED_EVENT':
            return {
                ...state,
                serverIdsForWhichRetrieveServerEventsByOperationIsRunning: [
                    ...state.serverIdsForWhichRetrieveServerEventsByOperationIsRunning.filter(
                        serverId => serverId !== action.serverId
                    )
                ]
            }

        case 'RETRIEVE_SERVER_EVENTS_BY_SUCCEEDED_EVENT':
            return {
                ...state,
                serverList: withServerEventsByUpdatedServerList(action.serverId, action.serverEvents),
                serverIdsForWhichRetrieveServerEventsByOperationIsRunning: [
                    ...state.serverIdsForWhichRetrieveServerEventsByOperationIsRunning.filter(
                        serverId => serverId !== action.serverId
                    )
                ]
            };


        case 'RESET_SERVER_EVENTS_BY_COMMAND':
            return {
                ...state,
                serverList: withEmptiedServerEventsByServerList()
            };


        case 'TIMELINE_INTERVALS_UPDATED_EVENT':
            return {
                ...state,
                selectedTimelineIntervalStart: action.timelineIntervalStart,
                selectedTimelineIntervalEnd: action.timelineIntervalEnd
            };


        case 'SELECT_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND': {
            const newState = { ...state };
            newState.activeStructuredDataExplorerAttributesByServerId[action.serverId] = [{
                byName: action.byName,
                byVal: action.byVal,
            }];
            return newState;
        }


        case 'ADD_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_COMMAND': {
            const newState = { ...state };
            if (newState.activeStructuredDataExplorerAttributesByServerId.hasOwnProperty(action.serverId)) {
                for (let attribute of newState.activeStructuredDataExplorerAttributesByServerId[action.serverId]) {
                    if (attribute.byName === action.byName && attribute.byVal === action.byVal) {
                        return { ...state };
                    }
                }
            } else {
                newState.activeStructuredDataExplorerAttributesByServerId[action.serverId] = [];
            }
            newState.activeStructuredDataExplorerAttributesByServerId[action.serverId].push({
                byName: action.byName,
                byVal: action.byVal,
            });
            return newState;
        }


        case 'REMOVED_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTE_EVENT': {
            const newState = { ...state };
            const remainingAttributes = [];
            if (newState.activeStructuredDataExplorerAttributesByServerId.hasOwnProperty(action.serverId)) {
                for (let attribute of newState.activeStructuredDataExplorerAttributesByServerId[action.serverId]) {
                    if (!(attribute.byName === action.byName && attribute.byVal === action.byVal)) {
                        remainingAttributes.push(attribute);
                    }
                }
                newState.activeStructuredDataExplorerAttributesByServerId[action.serverId] = remainingAttributes;
            } else {
                return { ...state };
            }
            return { ...newState };
        }


        case 'RESET_ACTIVE_STRUCTURED_DATA_EXPLORER_ATTRIBUTES_COMMAND': {
            const newState = { ...state };
            for (let serverId in newState.activeStructuredDataExplorerAttributesByServerId) {
                if (serverId === action.serverId) {
                    newState.activeStructuredDataExplorerAttributesByServerId[serverId] = [];
                }
            }
            return newState;
        }


        default:
            return state;
    }
}

export default reducer;
export { initialState };
