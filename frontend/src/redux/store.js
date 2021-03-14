import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';
import root from './reducers/root';
import { initialState as sessionInitialState } from './reducers/session';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const preloadedState = {
    session: {
        ...sessionInitialState
    }
};

const cookies = new Cookies();

if (cookies.getAll().hasOwnProperty('loggedInEmail') && cookies.getAll().hasOwnProperty('webappApiKeyId')) {
    preloadedState.session = {
        ...sessionInitialState,
        isLoggedIn: true,
        loggedInEmail: cookies.get('loggedInEmail'),
        webappApiKeyId: cookies.get('webappApiKeyId')
    };
}

export default function configureStore() {
    return createStore(
        root,
        preloadedState,
        composeEnhancers(applyMiddleware(thunk)),
    );
}
