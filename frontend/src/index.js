import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import './index.scss';
import AppContainer from './containers/AppContainer';
import configureStore from './redux/store';
import reportWebVitals from './reportWebVitals';

const urlParams = new URLSearchParams(window.location.search);

console.debug(`Looking for direct login info in ${window.location.search}`);
if (   urlParams.has('directLoginEmail')
    && urlParams.has('directLoginWebappApiKeyId')
) {
    console.debug(`Found direct login info in ${window.location.search}`);
    document.cookie = `loggedInEmail=${urlParams.get('directLoginEmail')};path=/;SameSite=Lax`;
    document.cookie = `webappApiKeyId=${urlParams.get('directLoginWebappApiKeyId')};path=/;SameSite=Lax`;
    document.cookie = `flipAllLatestEventsElementsOpen=1;path=/;SameSite=Lax`;
    window.location = '/#/servers/';
} else {
    ReactDOM.render(
        <Provider store={configureStore()}>
            <AppContainer />
        </Provider>,
        document.getElementById('root')
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
}
