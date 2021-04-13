import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import './index.scss';
import AppContainer from './containers/AppContainer';
import configureStore from './redux/store';

const urlParams = new URLSearchParams(window.location.search);

console.debug(`Looking for direct login info in ${window.location.search}`);
if (   urlParams.has('directLoginEmail')
    && urlParams.has('directLoginWebappApiKeyId')
) {
    console.debug(`Found direct login info in ${window.location.search}`);
    document.cookie = `loggedInEmail=${urlParams.get('directLoginEmail')};path=/;SameSite=Lax`;
    document.cookie = `webappApiKeyId=${urlParams.get('directLoginWebappApiKeyId')};path=/;SameSite=Lax`;
    // @ts-ignore
    window.location = '/#/servers/';
} else {
    ReactDOM.render(
        <Provider store={configureStore()}>
            <AppContainer />
        </Provider>,
        document.getElementById('root')
    );
}
