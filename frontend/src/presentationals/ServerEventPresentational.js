import React, { Fragment } from 'react';
import { format } from 'date-fns';
import DayzEventSkinPresentational from './eventSkins/dayz/DayzEventSkinPresentational';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const ServerEventPresentational = ({ event, serverType, showPayload }) => {

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

    return (
        <Fragment>
            <div
                className={`row ${isExplorable && 'clickable'}`}
                onClick={() =>
                    isExplorable
                    && this.handleLoadEventIntoStructuredDataExplorerClicked(event, true)
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
};

export default ServerEventPresentational;
