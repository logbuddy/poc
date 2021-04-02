import React, { Component, Fragment } from 'react';
import {connect} from "react-redux";
import {
    retrieveServerEventsByCommand,
} from '../redux/reducers/servers';
import JsonHelper from '../JsonHelper.mjs';
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { X, Upload } from "react-bootstrap-icons";

class StructuredDataExplorerContainer extends Component {
    constructor(props) {
        super(props)
        this.titleRef = React.createRef();
        this.resultsRef = React.createRef();

        this.state = {
            values: [],
            keys: [],
            keysValues: []
        };

        let parsedJson = null;
        try {
            parsedJson = JSON.parse(this.props.event.payload);
        } catch (e) {
            console.error('Cannot parse event payload into valid JSON', e);
            return;
        }

        if (parsedJson === null) {
            console.error('Could not parse payload into valid JSON');
        } else if (typeof(parsedJson) !== 'object') {
            console.error('JSON is not an object and therefore not explorable.');
        } else {
            const keyValuePairs = JsonHelper.flattenToKeyValuePairs(parsedJson);

            this.state = { ...this.state, values: JsonHelper.getBrokenDownValues(parsedJson) };

            this.state = { ...this.state, keys: JsonHelper.getBrokenDownKeys(keyValuePairs) };

            this.state = { ...this.state, keysValues: JsonHelper.getBrokenDownKeysAndValues(keyValuePairs) };
        }
    }

    handleExplorerBadgeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(retrieveServerEventsByCommand(serverId, byName, byVal));
    }

    componentDidMount() {
        if (this.titleRef.current !== null) {
            this.titleRef.current.scrollIntoView();
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.event.id !== this.props.event.id) {
            if (this.titleRef.current !== null) {
                this.titleRef.current.scrollIntoView();
            }
        }
    }

    render () {
        const createValueBadgeElement = (value, clickable = true) => {
            return <span
                key={value}
                className={`badge bg-success ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.event.serverId,
                            'value',
                            value
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                {value}
            </span>
        };

        const createKeyBadgeElement = (key, clickable = true) => {
            return <span
                key={key}
                className={`badge bg-primary ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.event.serverId,
                            'key',
                            key
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                {key.replaceAll(JsonHelper.separator, '.')}
            </span>
        };

        const createKeyValueBadgeElement = (keyValue, clickable = true) => {
            return <span
                key={keyValue}
                className={`explorer-key-value-badge ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.event.serverId,
                            'keyValue',
                            keyValue
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                    <span className='badge bg-primary ms-1 me-0 mb-1 explorer-key-value-badge-key'>
                        {keyValue.split(JsonHelper.separator).slice(0, -1).join('.')}
                    </span>
                    <span className='badge bg-success ms-0 me-1 mb-1 explorer-key-value-badge-value'>
                        {keyValue.split(JsonHelper.separator).slice(-1)}
                    </span>
                </span>
        };

        const valueElements = [];
        for (let value of this.state.values) {
            valueElements.push(createValueBadgeElement(value));
        }

        const keyElements = [];
        for (let key of this.state.keys) {
            keyElements.push(createKeyBadgeElement(key));
        }

        const keyValueElements = [];
        for (let keyValue of this.state.keysValues) {
            keyValueElements.push(createKeyValueBadgeElement(keyValue));
        }

        const eventByElements = [];
        for (let server of this.props.reduxState.servers.serverList) {
            if (server.id === this.props.event.serverId) {
                for (let eventBy of server.latestEventsBy) {
                    eventByElements.push(
                        <Fragment key={eventBy.id}>
                            <div className='row mb-3'>
                                <div className='col-sm-2 col-auto ps-1 pe-1 pt-0'>
                                    <code className='text-white-50 word-wrap-anywhere p-0'>
                                        {eventBy.createdAt}
                                        <br/>
                                        <span className='text-secondary me-2'>
                                            {eventBy.source}
                                        </span>
                                        <br/>
                                        <div
                                            className='clickable mt-3'
                                            onClick={() => {
                                                this.props.onUseEventClicked(eventBy);
                                                // For some reason this only works ALL the time if we fire it asynchronously:
                                                setTimeout(
                                                    () => this.titleRef.current.scrollIntoView(),
                                                    1
                                                );
                                            }}
                                        >
                                            <Upload width='1.5em' height='1.5em' className='text-primary' />
                                        </div>
                                    </code>
                                </div>
                                <div className='col ps-1 pe-1 pt-1'>
                                    <code className='word-wrap-anywhere'>
                                        <span className='text-white-75'>
                                            <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                                {JSON.stringify(JSON.parse(eventBy.payload), null, 2)}
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

        return (
            <div className='row'>
                <div className='col p-2 ms-1 me-1 mb-2 mt-1 bg-dark rounded'>
                    <X
                        className='close-button float-end clickable pe-1 pt-1'
                        onClick={this.props.onCloseClicked}
                    />
                    <h3 ref={this.titleRef}>Structured Data Explorer</h3>
                    <hr/>

                    <Fragment>
                        <p>
                            This is the currently loaded log entry:
                        </p>

                        <div className='mb-2'>
                            <code className='text-white-50 word-wrap-anywhere p-0'>
                                {this.props.event.createdAt}
                                <br/>
                                <span className='text-secondary me-2'>
                                    {this.props.event.source}
                                </span>
                                <br/>
                            </code>
                        </div>

                        <code className='word-wrap-anywhere'>
                            <span className='text-white-75'>
                                <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                    {JSON.stringify(JSON.parse(this.props.event.payload), null, 2)}
                                </SyntaxHighlighter>
                            </span>
                        </code>
                        <div className='mb-4'>
                            <p>
                                Based on the currently loaded log entry, you can now explore related log entries on these three dimensions:
                                {createKeyBadgeElement('key', false)},
                                {createValueBadgeElement('value', false)},
                                and
                                {createKeyValueBadgeElement('key' + JsonHelper.separator + 'value', false)}.
                            </p>
                            <p>
                                The list below shows all keys, all values, and all key-value pairs identified within the currently loaded log entry.
                            </p>
                            <p>
                                Clicking on any one element shows those log entries from this server that also match
                                the selected value, key, or key-value pair, and displays them below under the "Results" headline.
                            </p>
                            <p>
                                On each result, you can in turn click on the
                                <Upload width='2em' height='2em' className='ps-2 pe-2 text-primary' />
                                icon in order to load that log entry into the explorer.
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

                        <h4 ref={this.resultsRef}>Results</h4>
                        <hr/>

                        <div className='container-fluid bg-deepdark rounded p-3 pt-2 pb-2'>
                            {
                                this.props.reduxState.servers
                                    .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                    .includes(this.props.event.serverId)
                                &&
                                <Fragment>
                                    Retrieving...
                                </Fragment>
                            }

                            {
                                eventByElements.length > 0
                                &&
                                !this.props.reduxState.servers
                                    .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                    .includes(this.props.event.serverId)
                                &&
                                eventByElements
                            }

                            {
                                (
                                    eventByElements.length === 0
                                    &&
                                    !this.props.reduxState.servers
                                        .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                        .includes(this.props.event.serverId)
                                )
                                &&
                                <span className='text-secondary'>
                            Currently no results. Please click an element to start retrieving matching log entries.
                        </span>
                            }
                        </div>
                    </Fragment>

                </div>
            </div>
        )
    };
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(StructuredDataExplorerContainer);
