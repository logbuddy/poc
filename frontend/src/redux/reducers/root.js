import { combineReducers } from 'redux';
import session from './session';
import servers from './servers';
import activeServer from './activeServer';

export default combineReducers({
    session,
    servers,
    activeServer
});
