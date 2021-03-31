import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ArrowClockwise, Clipboard, ChevronRight, ChevronDown, Disc, PlayCircle, PauseCircle, X } from 'react-bootstrap-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
    createServerCommand,
    retrieveServerListCommand,
    flipServerListElementOpenCommand,
    flipServerListElementCloseCommand,
    retrieveYetUnseenServerEventsCommand,
    disableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    enableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    retrieveServerEventsByCommand,
    resetServerEventsByCommand
} from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'
import JsonHelper from '../JsonHelper.mjs';

class ServersContainer extends Component {
    constructor(props) {
        super(props);
        let filterEventsInputTexts = {};
        for (let i = 0; i < this.props.reduxState.servers.serverList; i++) {
            filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id] = '';
        }
        this.state = {
            createServerTitle: '',
            showCopySuccessBadgeForId: null,
            filterEventsInputTexts,
            exploreDialogueData: null
        };
        this.copyElements = {};
    }

    isFlippedOpen = (serverId, elementName) => {
        return this.props.reduxState.servers.serverListOpenElements[elementName].includes(serverId);
    };

    handleRefreshClicked = () => {
        this.setState({ ...this.state, exploreDialogueData: null });
        this.props.dispatch(retrieveServerListCommand());
    }

    handleChangeCreateServerTitle = (event) => {
        this.setState({ ...this.state, createServerTitle: event.target.value });
    }

    handleChangeFilterEventsInputText = (event, serverId) => {
        const filterEventsInputTexts = { ...this.state.filterEventsInputTexts };
        filterEventsInputTexts[serverId] = event.target.value;
        this.setState({ ...this.state, filterEventsInputTexts });
    }

    handleCreateServerClicked = (event) => {
        event.preventDefault();
        this.props.dispatch(createServerCommand(this.state.createServerTitle));
        this.setState({ ...this.state, createServerTitle: '' });
    }

    handleFlipElementOpenClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementOpenCommand(server.id, elementName));
        if (elementName === 'latestEvents') {
            this.props.dispatch(retrieveYetUnseenServerEventsCommand(
                server.id,
                server.latestEventSortValue
            ));
        }
    }

    handleFlipElementCloseClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementCloseCommand(server.id, elementName));
    }

    copyCodeToClipboard = (id) => {
        const el = this.copyElements[id];
        el.select();
        document.execCommand('copy');
        el.blur();
        this.setState({ ...this.state, showCopySuccessBadgeForId: id });
    }

    handleExploreDialogueOpenClicked = (serverId, serverEventId, payload) => {
        this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(serverId));
        this.props.dispatch(resetServerEventsByCommand());
        const exploreDialogueData = {
            serverId,
            serverEventId,
            payload,
            isStructured: false,
            values: null,
            keys: null,
            keysValues: null
        };

        let parsedJson = null;
        try {
            parsedJson = JSON.parse(payload);
        } catch (e) {
            console.error('Cannot parse payload into valid JSON', e);
        }

        if (parsedJson === null) {
            console.error('Could not parse payload into valid JSON');
        } else {
            const keyValuePairs = JsonHelper.flattenToKeyValuePairs(parsedJson);
            exploreDialogueData.values = JsonHelper.getBrokenDownValues(
                parsedJson
            );

            if (parsedJson !== null && typeof(parsedJson) === 'object') {
                exploreDialogueData.isStructured = true;
                exploreDialogueData.keys = JsonHelper.getBrokenDownKeys(
                    keyValuePairs
                );
                exploreDialogueData.keysValues = JsonHelper.getBrokenDownKeysAndValues(
                    keyValuePairs
                );
            }
        }

        this.setState({ ...this.state, exploreDialogueData });
    }

    handleExplorerBadgeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(retrieveServerEventsByCommand(serverId, byName, byVal));
    }

    componentDidMount() {
        this.props.dispatch(retrieveServerListCommand());
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        const createExploreDialogueElement = (exploreDialogueData) => {
            if (exploreDialogueData.isStructured !== true) {
                return <div className='row bg-dark rounded mt-3 mb-4 p-0'>
                    <div className='col p-2 pb-3 pt-2'>
                        The payload of this event is not structured.
                    </div>
                </div>
            }

            const createValueBadgeElement = (value) => {
                return <div
                    className='badge bg-success ms-1 me-1 clickable'
                    onClick={() => this.handleExplorerBadgeClicked(
                        exploreDialogueData.serverId,
                        'value',
                        value
                    )}
                >
                    {value}
                </div>
            };

            const createKeyBadgeElement = (key) => {
                return <div
                    className='badge bg-primary ms-1 me-1 clickable'
                    onClick={() => this.handleExplorerBadgeClicked(
                        exploreDialogueData.serverId,
                        'key',
                        key
                    )}
                >
                    {key.replaceAll(JsonHelper.separator, '.')}
                </div>
            };

            const createKeyValueBadgeElement = (keyValue) => {
                return <span
                    className='exlorer-key-value-badge clickable'
                    onClick={() => this.handleExplorerBadgeClicked(
                        exploreDialogueData.serverId,
                        'keyValue',
                        keyValue
                    )}
                >
                    <div className='badge bg-primary ms-1 me-0 exlorer-key-value-badge-key'>
                        {keyValue.split(JsonHelper.separator).slice(0, -1).join('.')}
                    </div>
                    <div className='badge bg-success ms-0 me-1 exlorer-key-value-badge-value'>
                        {keyValue.split(JsonHelper.separator).slice(-1)}
                    </div>
                </span>
            };

            const valueElements = [];
            for (let value of exploreDialogueData.values) {
                valueElements.push(createValueBadgeElement(value));
            }

            const keyElements = [];
            for (let key of exploreDialogueData.keys) {
                keyElements.push(createKeyBadgeElement(key));
            }

            const keyValueElements = [];
            for (let keyValue of exploreDialogueData.keysValues) {
                keyValueElements.push(createKeyValueBadgeElement(keyValue));
            }

            const latestEventsByElements = [];
            for (let server of this.props.reduxState.servers.serverList) {
                if (server.id === exploreDialogueData.serverId) {
                    for (let latestEventBy of server.latestEventsBy) {
                        latestEventsByElements.push(
                            <Fragment>
                                <div className='row mb-3'>
                                    <div className='col-sm-2 col-auto ps-1 pe-1 pt-0'>
                                        <code className='text-white-50 word-wrap-anywhere p-0'>
                                            {latestEventBy.createdAt}
                                            <br/>
                                            <span className='text-secondary me-2'>
                                                {latestEventBy.source}
                                            </span>
                                        </code>
                                    </div>
                                    <div className='col ps-1 pe-1 pt-1'>
                                        <code className='word-wrap-anywhere'>
                                            <span className='text-white-75'>
                                                <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                                    {JSON.stringify(JSON.parse(latestEventBy.payload), null, 2)}
                                                </SyntaxHighlighter>
                                            </span>
                                        </code>
                                    </div>
                                </div>
                                <hr/>
                            </Fragment>
                        );
                    }
                }
            }

            return <div className='row bg-dark rounded mt-3 mb-4 p-0 ms-1 me-1'>
                <div className='col p-3'>
                    <X
                        className='close-button float-end clickable'
                        onClick={() => this.setState({ ...this.state, exploreDialogueData: null })}
                    />
                    <h3>Structured Data Explorer</h3>
                    <hr/>
                    <div className='mb-4'>
                        <p>
                            You can further explore all server log entries which contain structured data
                            by these three dimension:
                            {createKeyBadgeElement('key')},
                            {createValueBadgeElement('value')},
                            and
                            {createKeyValueBadgeElement('key' + JsonHelper.separator + 'value')}.
                        </p>
                        <p>
                            The list below shows the keys, values, and key-value pairs identified within the current log entry.
                        </p>
                        <p>
                            Clicking on any one element shows those log entries from this server that also match the selected value, key, or key-value pair.
                        </p>
                    </div>

                    <hr/>

                    <div className='mb-5'>
                        <h5>Keys</h5>
                        {keyElements}
                    </div>

                    <div className='mb-5'>
                        <h5>Values</h5>
                        {valueElements}
                    </div>

                    <div className='mb-5'>
                        <h5>Keys and values</h5>
                        {keyValueElements}
                    </div>

                    <h4>Results</h4>
                    <hr/>

                    <div className='container-fluid bg-deepdark rounded p-3 pt-2 pb-2'>
                        {
                            this.props.reduxState.servers
                                .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                .includes(exploreDialogueData.serverId)
                            &&
                            <Fragment>
                                Retrieving...
                            </Fragment>
                        }

                        {
                            latestEventsByElements.length > 0
                            &&
                            !this.props.reduxState.servers
                            .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                            .includes(exploreDialogueData.serverId)
                            &&
                            latestEventsByElements
                        }

                        {
                            (
                                latestEventsByElements.length === 0
                                &&
                                !this.props.reduxState.servers
                                    .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                    .includes(exploreDialogueData.serverId)
                            )
                            &&
                            <span className='text-secondary'>
                                Currently no results. Please click an element to start retrieving matching log entries.
                            </span>
                        }
                    </div>

                </div>
            </div>
        };

        const createFlipElement = (server, elementName) => {
            const elementNameToHeadline = {
                information: 'Information',
                sampleCurlCommand: 'Sample curl command',
                latestEvents: 'Latest entries',
            };
            if (this.isFlippedOpen(server.id, elementName)) {
                const handleFlipElementCloseClicked = this.handleFlipElementCloseClicked;
                return <Fragment>
                    <div>
                        <span className='clickable' onClick={() => handleFlipElementCloseClicked(server, elementName)}>
                            <span className='align-text-top small'>
                                <ChevronDown />
                            </span>
                            &nbsp;
                            { elementNameToHeadline[elementName] }
                        </span>
                        {
                            elementName === 'latestEvents'
                            &&
                            <Fragment>
                                <div className='small float-end text-light mb-2'>
                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        &&
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(disableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Not polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PlayCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning not-spinning spinning-small text-white' />
                                        </div>
                                    }

                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        ||
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PauseCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning spinning-small text-primary' />
                                        </div>
                                    }
                                </div>
                                <hr className='float-none text-dark'/>
                            </Fragment>
                        }
                    </div>
                </Fragment>
            } else {
                const handleFlipElementOpenClicked = this.handleFlipElementOpenClicked;
                return <div className='clickable' onClick={() => handleFlipElementOpenClicked(server, elementName)}>
                    <span className='small align-text-bottom'>
                        <ChevronRight />
                    </span>
                    &nbsp;
                    { elementNameToHeadline[elementName] }
                </div>;
            }
        };

        const serverListElements = [];
        for (let i=0; i < this.props.reduxState.servers.serverList.length; i++) {
            const serverId = this.props.reduxState.servers.serverList[i].id;
            const serverEventElements = [];
            let index = 0;
            for (let j=0; j < this.props.reduxState.servers.serverList[i].latestEvents.length; j++) {
                const serverEventId = this.props.reduxState.servers.serverList[i].latestEvents[j].id;
                const createdAt = this.props.reduxState.servers.serverList[i].latestEvents[j].createdAt;
                const source = this.props.reduxState.servers.serverList[i].latestEvents[j].source;
                const payload = this.props.reduxState.servers.serverList[i].latestEvents[j].payload;
                let parsedPayload = '';
                try {
                    parsedPayload = JSON.parse(payload);
                } catch (e) {}
                let payloadToShow = '';
                if ('"' + parsedPayload + '"' === payload) {
                    payloadToShow = parsedPayload;
                } else {
                    payloadToShow = payload;
                }

                const textMatchesSearchterm = (text, searchterm) => {
                    const buildRegEx = (str, keywords) => {
                        return new RegExp("(?=.*?\\b" +
                            keywords
                                .split(" ")
                                .join(")(?=.*?\\b") +
                            ").*",
                            "i"
                        );
                    }

                    const test = (str, keywords, expected) => {
                        return buildRegEx(str, keywords).test(str) === expected
                    }

                    if (searchterm.substr(0, 1) === '!') {
                        return test(text, searchterm.substr(1), false);
                    } else {
                        return test(text, searchterm, true);
                    }
                };

                if (this.state.filterEventsInputTexts.hasOwnProperty(serverId) === false
                    ||
                    (     this.state.filterEventsInputTexts.hasOwnProperty(serverId)
                       && textMatchesSearchterm(`${createdAt} ${source} ${payload}`, this.state.filterEventsInputTexts[serverId])
                    )
                ) {
                    serverEventElements.push(
                        <Fragment>
                            <div key={index}
                                 className='row clickable mb-3'
                                 onClick={() => this.handleExploreDialogueOpenClicked(
                                     serverId,
                                     serverEventId,
                                     payload
                                )}
                            >
                                <div className='col-sm-12 ps-1 pe-1'>
                                    <code className='text-white-75 word-wrap-anywhere'>
                                        {createdAt}
                                    </code>
                                </div>
                                <div className='col-sm-12 ps-1 pe-1 mb-2'>
                                    <code className='text-white-50 word-wrap-anywhere'>
                                        {source}
                                    </code>
                                </div>
                                <div className='col-sm-12 ps-1 pe-1'>
                                    <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                        {payloadToShow}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                            {
                                (this.state.exploreDialogueData !== null
                                    && this.state.exploreDialogueData.serverId === serverId
                                    && this.state.exploreDialogueData.serverEventId === serverEventId)
                                &&
                                createExploreDialogueElement(this.state.exploreDialogueData)
                            }
                            <div key={j + 'gutter'} className='d-md-none d-sm-block border-top border-dark'>&nbsp;</div>
                        </Fragment>
                    );
                    index = index + 1;
                }
            }

            const sampleCurlCommand = `curl \\
  -X POST \\
  "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \\
  -d '{ "userId": "${this.props.reduxState.servers.serverList[i].userId}",
        "apiKeyId": "${this.props.reduxState.servers.serverList[i].apiKeyId}",
        "serverId": "${this.props.reduxState.servers.serverList[i].id}",
        "events": [{
                     "createdAt": "'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'",
                     "source": "uptime on '"$(hostname)"'",
                     "payload": "'"$(uptime)"'"
                   }]}'`;

            serverListElements.push(
                <div key={i} className={`card bg-dark mt-4 ${this.props.reduxState.servers.retrieveServerListOperation.isRunning ? 'opacity-25' : 'fade-in'}`}>
                    <div className='card-header border-bottom border-dark'>
                        <div className='row'>
                            <div className='text-primary col server-headline-icon'>
                                <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                            </div>
                            <div className='col server-headline-title'>
                                <h4 className='mb-0'>{this.props.reduxState.servers.serverList[i].title}</h4>
                            </div>
                        </div>
                    </div>
                    <div className='card-body bg-dark'>
                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'information') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'information')
                            &&
                            <Fragment>
                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>serverId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].id}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'id'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'id'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => {
                                                    this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'id');
                                                }}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>userId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].userId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'userId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'userId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'userId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>apiKeyId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].apiKeyId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'apiKeyId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'apiKeyId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'apiKeyId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </Fragment>
                        }


                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'sampleCurlCommand') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'sampleCurlCommand')
                            &&
                            <Fragment>
                                <div className='mb-2 mt-2 bg-deepdark pt-2 ps-4 pe-3 rounded border border-dark border-3'>
                                    <code><pre>{sampleCurlCommand}</pre></code>
                                </div>
                                <hr/>
                            </Fragment>
                        }

                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'latestEvents') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length > 0
                            &&
                            <div className='container-fluid w-100 bg-deepdark pt-2 pb-2 ps-4 pe-3 rounded border border-dark border-3'>

                                <div key='filters' className='row'>
                                    <div className='col ms-0 ps-0 me-1 pe-0 mb-2 mt-1'>
                                        <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                                        <div className='input-group'>
                                            <div className='input-group-text bg-dark border-dark'>Filter events</div>
                                            <input
                                                type='text'
                                                className='form-control bg-secondary text-white-50 border-dark'
                                                id='filter-events-input'
                                                placeholder=''
                                                value={this.state.filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id]}
                                                onChange={
                                                    (event) =>
                                                        this.handleChangeFilterEventsInputText(event, this.props.reduxState.servers.serverList[i].id)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {serverEventElements}
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length === 0
                            &&
                            <div className='row-cols-auto mt-3'>
                                No entries yet.
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length > 0
                            &&
                            this.state.filterEventsInputTexts.hasOwnProperty(this.props.reduxState.servers.serverList[i].id)
                            &&
                            this.state.filterEventsInputTexts[this.props.reduxState.servers.serverList[i].id].length > 0
                            &&
                            serverEventElements.length === 0
                            &&
                            <div className='row-cols-auto mt-3'>
                                No entries match the current filter.
                            </div>
                        }

                    </div>
                </div>
            );
        }

        return (
            <div className='m-4'>
                <div className='text-end float-end'>
                    <Fragment>
                        {
                            this.props.reduxState.servers.retrieveServerListOperation.isRunning
                            &&
                            <Disc className={`text-light ${this.props.reduxState.servers.retrieveServerListOperation.isRunning ? 'spinning' : 'spinning not-spinning'}`} />
                        }
                        {
                            this.props.reduxState.servers.retrieveServerListOperation.isRunning
                            ||
                            <span className='clickable' onClick={this.handleRefreshClicked}><ArrowClockwise className='spinning not-spinning' /></span>
                        }
                    </Fragment>
                </div>

                <ErrorMessagePresentational message={this.props.reduxState.servers.retrieveServerListOperation.errorMessage} />

                <h1 className='mb-3'>
                    My servers
                </h1>

                <div className='card card-body bg-dark pt-0'>
                    <form className='row row-cols-sm-auto g-3 mt-2 mb-2' onSubmit={this.handleCreateServerClicked}>
                        <div className='col-12'>
                            <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                            <div className='input-group'>
                                <div className='input-group-text'>Add server</div>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='create-server-title'
                                    placeholder='Name of new server'
                                    value={this.state.createServerTitle}
                                    onChange={this.handleChangeCreateServerTitle}
                                />
                            </div>
                        </div>

                        <div className='col-12'>
                            {
                                this.props.reduxState.servers.createServerOperation.isRunning
                                &&
                                <button className='float-end btn btn-warning disabled'>Adding...</button>
                            }
                            {
                                this.props.reduxState.servers.createServerOperation.isRunning
                                ||
                                (
                                    (this.state.createServerTitle.length > 0)
                                    &&
                                    <button type='submit' className='float-end btn btn-success fade-in'>Add</button>
                                )
                            }
                        </div>
                    </form>
                </div>

                {serverListElements}
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ServersContainer);
