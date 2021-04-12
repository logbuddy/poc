import { combineReducers } from 'redux';
import session from './session';
import servers from './servers';
import activeServer from './activeServer';

export default combineReducers({
    session,
    servers,
    activeServer
});

export interface BasicAction {
    readonly type: string
}

export interface ErrorAction {
    readonly type: string,
    readonly errorMessage: string
}
