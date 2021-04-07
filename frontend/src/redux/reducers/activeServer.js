import { apiFetch } from '../util';
import {endOfToday, set, subDays} from 'date-fns';

const initialState = {
    server: {
        id: null,
        title: null,
        events: [],
        structuredDataExplorerEvents: []
    },
    showEventPayload: true,
    retrieveServerEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveYetUnseenServerEventsOperation: {
        mustBeSkipped: false,
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    retrieveStructuredDataExplorerServerEventsOperation: {
        isRunning: false,
        justFinishedSuccessfully: false,
        errorMessage: null
    },
    activeStructuredDataExplorerAttributes: [],
    selectedTimelineIntervalStart: set(subDays(new Date(), 1), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
    selectedTimelineIntervalEnd: endOfToday(),
};

export const makeServerActiveCommand = (server) => (dispatch, getState) => {
    dispatch(madeServerActiveEvent(server));
};

export const madeServerActiveEvent = (server) => ({
    type: 'MADE_SERVER_ACTIVE_EVENT',
    server
});


export const closeActiveServerCommand = () => ({
    type: 'CLOSE_ACTIVE_SERVER_COMMAND'
});


const reducer = (state = initialState, action) => {

    switch (action.type) {

        case 'MADE_SERVER_ACTIVE_EVENT': {
            return {
                ...state,
                server: {
                    ...state.server,
                    id: action.server.id,
                    title: action.server.title
                }
            };
        }

        case 'CLOSE_ACTIVE_SERVER_COMMAND': {
            return initialState;
        }


        default: {
            return state;
        }
    }
}

export default reducer;
export { initialState };
