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
        this.ref = React.createRef();
        this.resultsRef = React.createRef();
    }

    handleExplorerBadgeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(retrieveServerEventsByCommand(serverId, byName, byVal));
    }

    componentDidMount() {
        this.ref.current.scrollIntoView();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.serverEventId !== this.props.serverEventId) {
            this.ref.current.scrollIntoView();
        }
    }

    render () {
        if (this.props.isStructured !== true) {
            return <div className='row bg-dark rounded mt-3 mb-4 p-0'>
                <div className='col p-2 pb-3 pt-2'>
                    The payload of this event is not structured.
                </div>
            </div>
        }

        const createValueBadgeElement = (value, clickable = true) => {
            return <div
                className={`badge bg-success ms-1 me-1 ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.serverId,
                            'value',
                            value
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                {value}
            </div>
        };

        const createKeyBadgeElement = (key, clickable = true) => {
            return <div
                className={`badge bg-primary ms-1 me-1 ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.serverId,
                            'key',
                            key
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                {key.replaceAll(JsonHelper.separator, '.')}
            </div>
        };

        const createKeyValueBadgeElement = (keyValue, clickable = true) => {
            return <span
                className={`explorer-key-value-badge ${clickable ? 'clickable' : ''}`}
                onClick={() => {
                    if (clickable === true) {
                        this.handleExplorerBadgeClicked(
                            this.props.serverId,
                            'keyValue',
                            keyValue
                        );
                        this.resultsRef.current.scrollIntoView();
                    }
                }}
            >
                    <div className='badge bg-primary ms-1 me-0 explorer-key-value-badge-key'>
                        {keyValue.split(JsonHelper.separator).slice(0, -1).join('.')}
                    </div>
                    <div className='badge bg-success ms-0 me-1 explorer-key-value-badge-value'>
                        {keyValue.split(JsonHelper.separator).slice(-1)}
                    </div>
                </span>
        };

        const valueElements = [];
        for (let value of this.props.values) {
            valueElements.push(createValueBadgeElement(value));
        }

        const keyElements = [];
        for (let key of this.props.keys) {
            keyElements.push(createKeyBadgeElement(key));
        }

        const keyValueElements = [];
        for (let keyValue of this.props.keysValues) {
            keyValueElements.push(createKeyValueBadgeElement(keyValue));
        }

        const eventByElements = [];
        for (let server of this.props.reduxState.servers.serverList) {
            if (server.id === this.props.serverId) {
                for (let eventBy of server.latestEventsBy) {
                    eventByElements.push(
                        <Fragment>
                            <div className='row mb-3'>
                                <div className='col-sm-2 col-auto ps-1 pe-1 pt-0'>
                                    <code className='text-white-50 word-wrap-anywhere p-0'>
                                        {eventBy.createdAt}
                                        <br/>
                                        <span className='text-secondary me-2'>
                                            {eventBy.source}
                                        </span>
                                        <div
                                            className='clickable mt-3'
                                            onClick={() => {
                                                this.props.onUseEventClicked(
                                                    this.props.serverId,
                                                    eventBy.id,
                                                    eventBy.payload
                                                );
                                                this.ref.current.scrollIntoView();
                                            }}
                                        >
                                            <Upload width='1.5em' height='1.5em' title='Foo' className='text-primary' />
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
            <div ref={this.ref} className='row'>
                <div className='col p-2 ms-1 me-1 mb-2 mt-1 bg-dark rounded'>
                    <X
                        className='close-button float-end clickable'
                        onClick={() => this.props.onCloseClicked() }
                    />
                    <h3>Structured Data Explorer</h3>
                    <hr/>
                    <p>
                        This is the currently loaded log entry:
                    </p>
                    <code className='word-wrap-anywhere'>
                        <span className='text-white-75'>
                            <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                {JSON.stringify(JSON.parse(this.props.payload), null, 2)}
                            </SyntaxHighlighter>
                        </span>
                    </code>
                    <div className='mb-4'>
                        <p>
                            Based on the currently loaded log entry, you can now explore related log entries by these three dimensions:
                            {createKeyBadgeElement('key', false)},
                            {createValueBadgeElement('value', false)},
                            and
                            {createKeyValueBadgeElement('key' + JsonHelper.separator + 'value', false)}.
                        </p>
                        <p>
                            The list below shows the keys, values, and key-value pairs identified within the currently loaded log entry.
                        </p>
                        <p>
                            Clicking on any one element shows those log entries from this server that also match
                            the selected value, key, or key-value pair, and displays those below under "Results".
                        </p>
                        <p>
                            On each result, you can click on the
                            <Upload width='2em' height='2em' title='Foo' className='ps-2 pe-2 text-primary' />
                            icon in order to load that result into the explorer.
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
                                .includes(this.props.serverId)
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
                                .includes(this.props.serverId)
                            &&
                            eventByElements
                        }

                        {
                            (
                                eventByElements.length === 0
                                &&
                                !this.props.reduxState.servers
                                    .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                    .includes(this.props.serverId)
                            )
                            &&
                            <span className='text-secondary'>
                                Currently no results. Please click an element to start retrieving matching log entries.
                            </span>
                        }
                    </div>

                </div>
            </div>
        )
    };
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(StructuredDataExplorerContainer);
