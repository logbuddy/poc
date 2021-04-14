import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import './index.scss';
import configureStore from './redux/store';
import AppPresentational from './presentationals/AppPresentational';
import { HashRouter as Router } from 'react-router-dom';

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
            <Router>
                <AppPresentational />
            </Router>
        </Provider>,
        document.getElementById('root')
    );
}
