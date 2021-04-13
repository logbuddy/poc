import { AnyAction, combineReducers } from 'redux';
import session, { SessionAction, SessionState } from './session';
import activeServer from './activeServer';
import servers, { ServersAction, ServersState } from './servers';

export default combineReducers({
    session,
    servers,
    activeServer
});

export interface BasicAction extends AnyAction {
    readonly type: string
}

export interface ErrorAction extends BasicAction {
    readonly errorMessage: string
}

export interface Operation {
    readonly isRunning: boolean,
    readonly justFinishedSuccessfully: boolean,
    readonly errorMessage: null | string
}

export interface ReduxState {
    readonly session: SessionState,
    readonly servers: ServersState,
    readonly activeServer: {
        readonly server: {
            readonly id: string
        }
    }
}

export type ValidAction = SessionAction | ServersAction;
