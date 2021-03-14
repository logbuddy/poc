import { combineReducers } from 'redux';
import session from './session';
import servers from './servers';

export default combineReducers({
    session,
    servers
});
