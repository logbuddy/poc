import React, { Fragment } from 'react';
import { format } from 'date-fns';
import DayzEventSkinPresentational from './eventSkins/dayz/DayzEventSkinPresentational';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import {
    LOG_EVENTS_PRESENTATION_MODE_COMPACT,
    LOG_EVENTS_PRESENTATION_MODE_DEFAULT
} from '../redux/reducers/activeServer';

const ServerEventPresentational = ({ event, serverType, showPayload, onClick, presentationMode }) => {

    let createdAtUtc = null;
    if (event.hasOwnProperty('createdAtUtc')) {
        createdAtUtc = event.createdAtUtc;
    }
    const source = event.source;
    const payload = event.payload;
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

    const isExplorable = typeof(parsedPayload) === 'object';


    if (presentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT) {
        return (
            <Fragment>
                <div
                    className={`row ${isExplorable && 'clickable'}`}
                    onClick={() =>
                        isExplorable
                        && onClick()
                    }
                >
                    <div className='col-sm-12 ps-2 pe-2'>
                        <code className='text-white-75 word-wrap-anywhere'>
                            {
                                createdAtUtc !== null
                                &&
                                format(new Date(createdAtUtc), 'PPPP · pp')
                            }
                            {
                                createdAtUtc === null
                                &&
                                event.createdAt
                            }
                        </code>
                    </div>
                    <div className='col-sm-12 ps-2 pe-2 mb-2'>
                        <code className='text-white-50 word-wrap-anywhere'>
                            {source}
                        </code>
                    </div>
                    <div className='col-sm-12 ps-1 pe-1'>
                        {
                            isExplorable
                            &&
                            <Fragment>
                                {
                                    serverType === 'dayz'
                                    &&
                                    <DayzEventSkinPresentational event={event} />
                                }
                                {
                                    showPayload
                                    &&
                                    <SyntaxHighlighter language="json" style={a11yDark} wrapLongLines={true} className='rounded'>
                                        {payloadToShow}
                                    </SyntaxHighlighter>
                                }
                            </Fragment>
                        }

                        {
                            isExplorable
                            ||
                            <SyntaxHighlighter language="text" style={a11yDark} wrapLongLines={true} className='rounded'>
                                {payloadToShow}
                            </SyntaxHighlighter>
                        }
                    </div>
                </div>
                <div className='d-md-none d-sm-block border-top border-dark'>&nbsp;</div>
            </Fragment>
        );
    }

    if (presentationMode === LOG_EVENTS_PRESENTATION_MODE_COMPACT) {
        return (
            <Fragment>
                <div
                    className={`row ${isExplorable && 'clickable'}`}
                    onClick={() =>
                        isExplorable
                        && onClick()
                    }
                >
                    <div className='col-sm-12 col-md-4 col-lg-4 col-xl-3 col-xxl-2 ps-2 pe-2'>
                        <code>
                            <span className='pe-2'>
                                {
                                    createdAtUtc !== null
                                    &&
                                    format(new Date(createdAtUtc), 'yyyy-MM-dd HH:mm:ss')
                                }
                                {
                                    createdAtUtc === null
                                    &&
                                    event.createdAt
                                }
                            </span>

                            <span className='word-wrap-anywhere'>
                                <br className='d-sm-block d-xxl-none' />
                                <span className='text-secondary'>
                                    {source}
                                </span>
                            </span>
                        </code>
                    </div>
                    <div className='col ps-sm-2'>
                        <code className='text-white-75 word-wrap-anywhere'>
                            {payloadToShow}
                        </code>
                    </div>
                </div>
                <div className='d-md-none d-sm-block mt-4 border-top border-dark'>&nbsp;</div>
            </Fragment>
        );
    }
};

export default ServerEventPresentational;
