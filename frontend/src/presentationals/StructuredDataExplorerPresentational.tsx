import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux'
// @ts-ignore
import { JsonHelper } from 'herodot-shared';
import { ReduxState } from '../redux/reducers/root';
import { ServerEvent } from '../redux/reducers/servers';
import {
    addActiveStructuredDataExplorerAttributeCommand, removeActiveStructuredDataExplorerAttributeCommand,
    retrieveStructuredDataExplorerEventsCommand,
    selectActiveStructuredDataExplorerAttributeCommand,
    Server
} from '../redux/reducers/activeServer';
import { DashCircle, Disc, PlusCircle, X } from 'react-bootstrap-icons';
import { format } from 'date-fns';
import DayzEventSkinPresentational from './eventSkins/dayz/DayzEventSkinPresentational';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const getAttributesForEvent = (event: ServerEvent) => {
    let parsedJson = null;
    let values: Array<string> = [];
    let keys: Array<string> = [];
    let keysValues: Array<string> = [];
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

const StructuredDataExplorerPresentational = ({ event, server, onCloseClicked }:
                                                  { readonly event: ServerEvent, readonly server: Server, readonly onCloseClicked: () => any }) => {

    const reduxState = useSelector((state: ReduxState) => state);
    const reduxDispatch = useDispatch();

    const values = getAttributesForEvent(event).values;
    const keys = getAttributesForEvent(event).keys;
    const keysValues = getAttributesForEvent(event).keysValues;

    const handleSelectAttributeClicked = (byName: string, byVal: string) => {
        reduxDispatch(selectActiveStructuredDataExplorerAttributeCommand(byName, byVal));
        reduxDispatch(retrieveStructuredDataExplorerEventsCommand());
    }

    const handleAddAttributeClicked = (byName: string, byVal: string) => {
        reduxDispatch(addActiveStructuredDataExplorerAttributeCommand(byName, byVal));
        reduxDispatch(retrieveStructuredDataExplorerEventsCommand());
    }

    const handleRemoveAttributeClicked = (byName: string, byVal: string) => {
        reduxDispatch(removeActiveStructuredDataExplorerAttributeCommand(byName, byVal));
    }


    const createAttributeElement = (byName: string, byVal: string, clickable = true, plus = true, minus = false) => {
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

    const createValueAttributeElement = (value: string, clickable = true, plus = true, minus = false) => {
        return (
            <Fragment key={value}>
                    <span
                        className={`badge bg-success ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable) {
                                handleSelectAttributeClicked(
                                    'value',
                                    value
                                );
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
                            if (clickable) {
                                handleAddAttributeClicked(
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
                            if (clickable) {
                                handleRemoveAttributeClicked(
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

    const createKeyAttributeElement = (key: string, clickable = true, plus = true, minus = false) => {
        return (
            <Fragment key={key}>
                    <span
                        className={`badge bg-primary ms-1 me-1 mb-1 ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable) {
                                handleSelectAttributeClicked(
                                    'key',
                                    key
                                );
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
                            if (clickable) {
                                handleAddAttributeClicked(
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
                            if (clickable) {
                                handleRemoveAttributeClicked(
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

    const createKeyValueAttributeElement = (keyValue: string, clickable = true, plus = true, minus = false) => {
        return (
            <Fragment key={keyValue}>
                    <span
                        className={`explorer-key-value-badge ${clickable ? 'clickable' : ''}`}
                        onClick={() => {
                            if (clickable) {
                                handleSelectAttributeClicked(
                                    'keyValue',
                                    keyValue
                                );
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
                            if (clickable) {
                                handleAddAttributeClicked(
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
                            if (clickable) {
                                handleRemoveAttributeClicked(
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
    for (let value of values) {
        valueElements.push(createValueAttributeElement(value));
    }

    const keyElements = [];
    for (let key of keys) {
        keyElements.push(createKeyAttributeElement(key));
    }

    const keyValueElements = [];
    for (let keyValue of keysValues) {
        keyValueElements.push(createKeyValueAttributeElement(keyValue));
    }

    const selectedAttributeElements = [];
    for (let selectedAttribute of reduxState.activeServer.activeStructuredDataExplorerAttributes) {
        selectedAttributeElements.push(
            createAttributeElement(selectedAttribute.byName, selectedAttribute.byVal, true, false, true)
        );
    }

    const resultElements = [];
    for (let event of reduxState.activeServer.server.structuredDataExplorerEvents) {
        const { values, keys, keysValues } = getAttributesForEvent(event);

        const valueAttributeElements = [];
        for (let value of values) {
            let add = true;
            for (let activeAttribute of reduxState.activeServer.activeStructuredDataExplorerAttributes) {
                if (activeAttribute.byName === 'value' && activeAttribute.byVal === value) {
                    add = false;
                }
            }
            if (add) valueAttributeElements.push(createValueAttributeElement(value));
        }
        const keyAttributeElements = [];
        for (let key of keys) {
            let add = true;
            for (let activeAttribute of reduxState.activeServer.activeStructuredDataExplorerAttributes) {
                if (activeAttribute.byName === 'key' && activeAttribute.byVal === key) {
                    add = false;
                }
            }
            if (add) keyAttributeElements.push(createKeyAttributeElement(key));
        }

        const keyValueAttributeElements = [];
        for (let keyValue of keysValues) {
            let add = true;
            for (let activeAttribute of reduxState.activeServer.activeStructuredDataExplorerAttributes) {
                if (activeAttribute.byName === 'keyValue' && activeAttribute.byVal === keyValue) {
                    add = false;
                }
            }
            if (add) keyValueAttributeElements.push(createKeyValueAttributeElement(keyValue));
        }

        resultElements.push(
            <Fragment key={event.id}>
                <div className='row mb-3'>
                    <div className='col-sm-2 col-auto ps-1 pe-1 pt-0'>
                        <code className='text-white-50 word-wrap-anywhere p-0'>
                            {
                                (event.hasOwnProperty('createdAtUtc') && event.createdAtUtc !== null)
                                &&
                                <span>
                                        {format(new Date(event.createdAtUtc), 'PPPP')}
                                    <br/>
                                    {format(new Date(event.createdAtUtc), 'pp')}
                                    </span>
                            }
                            {
                                (event.hasOwnProperty('createdAtUtc') && event.createdAtUtc !== null)
                                ||
                                event.createdAt
                            }
                            <br/>
                            <span className='text-secondary me-2'>
                                    {event.source}
                                </span>
                        </code>
                    </div>
                    <div className='col ps-1 pe-1 pt-1'>
                        <code className='word-wrap-anywhere'>
                                <span className='text-white-75'>
                                    {
                                        server.type === 'dayz'
                                        &&
                                        <DayzEventSkinPresentational event={event} />
                                    }
                                    {
                                        reduxState.activeServer.showEventPayload
                                        &&
                                        <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                            {JSON.stringify(JSON.parse(event.payload), null, 2)}
                                        </SyntaxHighlighter>
                                    }

                                    {
                                        reduxState.activeServer.showStructuredDataExplorerAttributes
                                        &&
                                        <Fragment>
                                            {
                                                valueAttributeElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {valueAttributeElements}
                                                </Fragment>
                                            }
                                            {
                                                keyAttributeElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {keyAttributeElements}
                                                </Fragment>
                                            }
                                            {
                                                keyValueAttributeElements.length > 0
                                                &&
                                                <Fragment>
                                                    <hr/>
                                                    {keyValueAttributeElements}
                                                </Fragment>
                                            }
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

    return (
        <Fragment>
            <div className='card-header border-bottom border-dark'>
                <X
                    className='close-button float-end clickable pe-1 pt-1'
                    onClick={onCloseClicked}
                />
                <h3>Structured Data Explorer</h3>
                <hr/>
            </div>
            <div className='card-body rounded p-0 m-3'>
                <Fragment>
                    <p>
                        This is the currently loaded log entry:
                    </p>

                    <div className='mb-2'>
                        <code className='text-white-50 word-wrap-anywhere p-0'>
                            {event.createdAt}
                            <br/>
                            <span className='text-secondary me-2'>
                                    {event.source}
                                </span>
                            <br/>
                        </code>
                    </div>

                    {
                        server.type === 'dayz'
                        &&
                        <DayzEventSkinPresentational event={event} />
                    }

                    <code className='word-wrap-anywhere'>
                            <span className='text-white-75'>
                                {
                                    reduxState.activeServer.showEventPayload
                                    &&
                                    <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                        {JSON.stringify(JSON.parse(event.payload), null, 2)}
                                    </SyntaxHighlighter>
                                }
                            </span>
                    </code>

                    {
                        reduxState.activeServer.showStructuredDataExplorerAttributes
                        &&
                        <Fragment>
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
                        </Fragment>
                    }

                    <h4>
                        {
                            resultElements.length > 0
                            &&
                            <Fragment>{resultElements.length}&nbsp;</Fragment>
                        }
                        {
                            resultElements.length === 1
                            &&
                            <Fragment>Result</Fragment>
                        }
                        {
                            resultElements.length !== 1
                            &&
                            <Fragment>Results</Fragment>
                        }
                        {
                            reduxState.activeServer.retrieveStructuredDataExplorerEventsOperation.isRunning
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
                            resultElements.length > 0
                            &&
                            resultElements
                        }

                        {
                            (
                                resultElements.length === 0
                                &&
                                !reduxState.activeServer.retrieveStructuredDataExplorerEventsOperation.isRunning
                            )
                            &&
                            <span className='text-secondary'>
                                    Currently no results for the selected time range and filter elements.
                                </span>
                        }
                    </div>
                </Fragment>

            </div>
        </Fragment>
    );
};

export default StructuredDataExplorerPresentational;
