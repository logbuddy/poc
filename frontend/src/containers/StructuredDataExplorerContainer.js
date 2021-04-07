import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';
import {
    addActiveStructuredDataExplorerAttributeCommand,
    removeActiveStructuredDataExplorerAttributeCommand,
    retrieveServerEventsByCommand,
    selectActiveStructuredDataExplorerAttributeCommand,
} from '../redux/reducers/servers';
import JsonHelper from '../JsonHelper.mjs';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import {X, Upload, PlusCircle, DashCircle, Disc} from 'react-bootstrap-icons';
import DayzEventSkinPresentational from "../presentationals/eventSkins/dayz/DayzEventSkinPresentational";
import { format } from "date-fns";

const getAttributesForEvent = (event) => {
    let parsedJson = null;
    let values = [];
    let keys = [];
    let keysValues = [];
    try {
        parsedJson = JSON.parse(event.payload);
    } catch (e) {
        console.error('Cannot parse event payload into valid JSON', e);
        return { values, keys, keysValues };
    }

    if (parsedJson === null) {
        console.error('Could not parse payload into valid JSON');
        return { values, keys, keysValues };
    } else if (typeof(parsedJson) !== 'object') {
        console.error('JSON is not an object and therefore not explorable.');
        return { values, keys, keysValues };
    } else {
        const keyValuePairs = JsonHelper.flattenToKeyValuePairs(parsedJson);

        return {
            values: JsonHelper.getBrokenDownValues(parsedJson),
            keys: JsonHelper.getBrokenDownKeys(keyValuePairs),
            keysValues: JsonHelper.getBrokenDownKeysAndValues(keyValuePairs)
        };
    }
};

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
    }

    calculateAttributes = () => {
        const { values, keys, keysValues } = getAttributesForEvent(this.props.event);
        this.setState({
            ...this.state,
            values: values,
            keys: keys,
            keysValues: keysValues
        });
    };

    handleSelectAttributeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(selectActiveStructuredDataExplorerAttributeCommand(serverId, byName, byVal));
        this.props.dispatch(retrieveServerEventsByCommand(serverId));
    }

    handleAddAttributeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(addActiveStructuredDataExplorerAttributeCommand(serverId, byName, byVal));
        this.props.dispatch(retrieveServerEventsByCommand(serverId));
    }

    handleRemoveAttributeClicked = (serverId, byName, byVal) => {
        this.props.dispatch(removeActiveStructuredDataExplorerAttributeCommand(serverId, byName, byVal));
    }

    componentDidMount() {
        if (this.titleRef.current !== null) {
            this.titleRef.current.scrollIntoView();
        }
        this.calculateAttributes();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.event.id !== this.props.event.id) {
            this.calculateAttributes();
            if (this.titleRef.current !== null) {
                this.titleRef.current.scrollIntoView();
            }
        }
    }

    render () {
        const createAttributeElement = (byName, byVal, clickable = true, plus = true, minus = false) => {
            if (byName === 'value') {
                return createValueAttributeElement(byVal, clickable, plus, minus);
            }
            if (byName === 'key') {
                return createKeyAttributeElement(byVal, clickable, plus, minus);
            }
            if (byName === 'keyValue') {
                return createKeyValueAttributeElement(byVal, clickable, plus, minus);
            }
            throw new Error('Unknown byName');
        };

        const createValueAttributeElement = (value, clickable = true, plus = true, minus = false) => {
            return (
                <Fragment key={value}>
                    <span
                        className={`badge bg-success ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable === true) {
                                this.handleSelectAttributeClicked(
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
                    {
                        plus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleAddAttributeClicked(
                                        this.props.event.serverId,
                                        'value',
                                        value
                                    );
                                }
                            }}
                        >
                            <PlusCircle/>
                        </span>
                    }
                    {
                        minus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleRemoveAttributeClicked(
                                        this.props.event.serverId,
                                        'value',
                                        value
                                    );
                                }
                            }}
                        >
                            <DashCircle/>
                        </span>
                    }
                </Fragment>
            )
        };

        const createKeyAttributeElement = (key, clickable = true, plus = true, minus = false) => {
            return (
                <Fragment key={key}>
                    <span
                        className={`badge bg-primary ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable === true) {
                                this.handleSelectAttributeClicked(
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
                    {
                        plus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleAddAttributeClicked(
                                        this.props.event.serverId,
                                        'key',
                                        key
                                    );
                                }
                            }}
                        >
                            <PlusCircle/>
                        </span>
                    }
                    {
                        minus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleRemoveAttributeClicked(
                                        this.props.event.serverId,
                                        'key',
                                        key
                                    );
                                }
                            }}
                        >
                            <DashCircle/>
                        </span>
                    }
                </Fragment>
            )
        };

        const createKeyValueAttributeElement = (keyValue, clickable = true, plus = true, minus = false) => {
            return (
                <Fragment key={keyValue}>
                    <span
                        className={`explorer-key-value-badge ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable === true) {
                                this.handleSelectAttributeClicked(
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
                    {
                        plus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleAddAttributeClicked(
                                        this.props.event.serverId,
                                        'keyValue',
                                        keyValue
                                    );
                                }
                            }}
                        >
                            <PlusCircle/>
                        </span>
                    }
                    {
                        minus
                        &&
                        <span
                            className={`${clickable ? 'clickable' : ''} me-3`}
                            onClick={() => {
                                if (clickable === true) {
                                    this.handleRemoveAttributeClicked(
                                        this.props.event.serverId,
                                        'keyValue',
                                        keyValue
                                    );
                                }
                            }}
                        >
                            <DashCircle/>
                        </span>
                    }
                </Fragment>
            )
        };

        const valueElements = [];
        for (let value of this.state.values) {
            valueElements.push(createValueAttributeElement(value));
        }

        const keyElements = [];
        for (let key of this.state.keys) {
            keyElements.push(createKeyAttributeElement(key));
        }

        const keyValueElements = [];
        for (let keyValue of this.state.keysValues) {
            keyValueElements.push(createKeyValueAttributeElement(keyValue));
        }

        const selectedAttributeElements = [];
        if (this.props.reduxState.servers.activeStructuredDataExplorerAttributesByServerId.hasOwnProperty(this.props.event.serverId)) {
            for (let selectedAttribute of this.props.reduxState.servers.activeStructuredDataExplorerAttributesByServerId[this.props.event.serverId]) {
                selectedAttributeElements.push(
                    createAttributeElement(selectedAttribute.byName, selectedAttribute.byVal, true, false, true)
                );
            }
        }

        const eventByElements = [];
        for (let server of this.props.reduxState.servers.serverList) {
            if (server.id === this.props.event.serverId) {
                for (let eventBy of server.latestEventsBy) {
                    const { values, keys, keysValues } = getAttributesForEvent(eventBy);

                    const eventByValueElements = [];
                    for (let value of values) {
                        let add = true;
                        for (let activeAttribute of this.props.reduxState.servers.activeStructuredDataExplorerAttributesByServerId[this.props.event.serverId]) {
                            if (activeAttribute.byName === 'value' && activeAttribute.byVal === value) {
                                add = false;
                            }
                        }
                        if (add) eventByValueElements.push(createValueAttributeElement(value));
                    }
                    const eventByKeyElements = [];
                    for (let key of keys) {
                        let add = true;
                        for (let activeAttribute of this.props.reduxState.servers.activeStructuredDataExplorerAttributesByServerId[this.props.event.serverId]) {
                            if (activeAttribute.byName === 'key' && activeAttribute.byVal === key) {
                                add = false;
                            }
                        }
                        if (add) eventByKeyElements.push(createKeyAttributeElement(key));
                    }

                    const eventByKeyValueElements = [];
                    for (let keyValue of keysValues) {
                        let add = true;
                        for (let activeAttribute of this.props.reduxState.servers.activeStructuredDataExplorerAttributesByServerId[this.props.event.serverId]) {
                            if (activeAttribute.byName === 'keyValue' && activeAttribute.byVal === keyValue) {
                                add = false;
                            }
                        }
                        if (add) eventByKeyValueElements.push(createKeyValueAttributeElement(keyValue));
                    }

                    eventByElements.push(
                        <Fragment key={eventBy.id}>
                            <div className='row mb-3'>
                                <div className='col-sm-2 col-auto ps-1 pe-1 pt-0'>
                                    <code className='text-white-50 word-wrap-anywhere p-0'>
                                        {
                                            (eventBy.hasOwnProperty('createdAtUtc') && eventBy.createdAtUtc !== null)
                                            &&
                                            format(new Date(eventBy.createdAtUtc), 'PPPP · pp')
                                        }
                                        {
                                            (eventBy.hasOwnProperty('createdAtUtc') && eventBy.createdAtUtc !== null)
                                            ||
                                            eventBy.createdAt
                                        }
                                        <br/>
                                        <span className='text-secondary me-2'>
                                            {eventBy.source}
                                        </span>
                                    </code>
                                </div>
                                <div className='col ps-1 pe-1 pt-1'>
                                    <code className='word-wrap-anywhere'>
                                        <span className='text-white-75'>
                                            {
                                                this.props.server.type === 'dayz'
                                                &&
                                                <DayzEventSkinPresentational event={eventBy} />
                                            }
                                            {
                                                this.props.reduxState.servers.showEventPayload
                                                &&
                                                <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                                    {JSON.stringify(JSON.parse(eventBy.payload), null, 2)}
                                                </SyntaxHighlighter>
                                            }
                                            {
                                                eventByValueElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {eventByValueElements}
                                                </Fragment>
                                            }
                                            {
                                                eventByKeyElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {eventByKeyElements}
                                                </Fragment>
                                            }
                                            {
                                                eventByKeyValueElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {eventByKeyValueElements}
                                                </Fragment>
                                            }
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

                        {
                            this.props.server.type === 'dayz'
                            &&
                            <DayzEventSkinPresentational event={this.props.event} />
                        }

                        <code className='word-wrap-anywhere'>
                            <span className='text-white-75'>
                                {
                                    this.props.reduxState.servers.showEventPayload
                                    &&
                                    <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                        {JSON.stringify(JSON.parse(this.props.event.payload), null, 2)}
                                    </SyntaxHighlighter>
                                }
                            </span>
                        </code>
                        <div className='mb-4'>
                            <p>
                                Based on the currently loaded log entry, you can now explore related log entries on these three dimensions:
                                {createKeyAttributeElement('key', false, false)},
                                {createValueAttributeElement('value', false, false)},
                                and
                                {createKeyValueAttributeElement('key' + JsonHelper.separator + 'value', false, false)}.
                            </p>
                            <p>
                                The list below shows all keys, all values, and all key-value pairs identified within the currently loaded log entry.
                            </p>
                            <p>
                                Clicking on any one element shows those log entries from this server that also match
                                the selected value, key, or key-value pair, and displays them below under the "Results" headline.
                            </p>
                            <p>
                                Click the <PlusCircle/> icon of another value, key, or key-value pair to further filter down the
                                resulting list of log entries.
                            </p>
                            <p>
                                On each result, you can in turn refine your search further by click on the
                                key, value, or key-value attributes of the result.
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

                        <h4 ref={this.resultsRef}>
                            {
                                eventByElements.length > 0
                                &&
                                <Fragment>{eventByElements.length}&nbsp;</Fragment>
                            }
                            {
                                eventByElements.length === 1
                                &&
                                <Fragment>Result</Fragment>
                            }
                            {
                                eventByElements.length !== 1
                                &&
                                <Fragment>Results</Fragment>
                            }
                            {
                                this.props.reduxState.servers
                                    .serverIdsForWhichRetrieveServerEventsByOperationIsRunning
                                    .includes(this.props.event.serverId)
                                &&
                                <Disc className='spinning' />
                            }
                        </h4>
                        {
                            selectedAttributeElements.length > 0
                            &&
                            <Fragment>
                                <hr/>
                                Filtered by: {selectedAttributeElements}
                            </Fragment>
                        }
                        <hr/>
                        <div className='container-fluid bg-deepdark rounded p-3 pt-2 pb-2'>
                            {
                                eventByElements.length > 0
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
                                    Currently no results for the selected time range and filter elements.
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
