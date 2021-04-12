import { AnyAction, combineReducers } from 'redux';
import session, { SessionState } from './session';
import servers from './servers';
import activeServer from './activeServer';
import { DispatchProp } from 'react-redux';

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
    readonly servers: object,
    readonly activeServer: object
}

export interface ConnectedComponentProps {
    readonly reduxState: ReduxState,
    readonly dispatch: DispatchProp
}
