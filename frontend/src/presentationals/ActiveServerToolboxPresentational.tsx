import { useSelector, useDispatch } from 'react-redux'
import { IReduxState } from '../redux/reducers/root';
import React, { Fragment } from 'react';
import {
    switchShowEventPayloadCommand,
    switchShowStructuredDataExplorerAttributesCommand
} from '../redux/reducers/activeServer';
import { FileEarmarkCode, FileEarmarkCodeFill } from 'react-bootstrap-icons';

const ActiveServerToolboxPresentational = () => {

    const reduxState = useSelector((state: IReduxState) => state);
    const reduxDispatch = useDispatch();

    const activeServer = reduxState.activeServer;

    return (
        <div className='mt-2 text-white-75'>

            {
                activeServer.eventLoadedInStructuredDataExplorer !== null
                &&
                <Fragment>
                    {
                        activeServer.showStructuredDataExplorerAttributes
                        &&
                        <div
                            className='small clickable d-inline-block'
                            onClick={ () => reduxDispatch(switchShowStructuredDataExplorerAttributesCommand()) }
                        >
                    <span className="explorer-key-value-badge">
                        <span className="badge bg-primary ms-1 me-0 mb-1 explorer-key-value-badge-key">&nbsp;</span>
                        <span className="badge bg-success ms-0 me-1 mb-1 explorer-key-value-badge-value">&nbsp;</span>
                    </span>
                        </div>
                    }
                    {
                        activeServer.showStructuredDataExplorerAttributes
                        ||
                        <div
                            className='small clickable d-inline-block'
                            onClick={ () => reduxDispatch(switchShowStructuredDataExplorerAttributesCommand()) }
                        >
                    <span className="explorer-key-value-badge">
                        <span className="badge bg-dark ms-1 me-0 mb-1 explorer-key-value-badge-key">&nbsp;</span>
                        <span className="badge bg-secondary ms-0 me-1 mb-1 explorer-key-value-badge-value">&nbsp;</span>
                    </span>
                        </div>
                    }
                </Fragment>
            }

            {
                activeServer.showEventPayload
                &&
                <div
                    className='clickable d-inline-block'
                    onClick={ () => reduxDispatch(switchShowEventPayloadCommand()) }
                >
                    <FileEarmarkCodeFill width='15px' height='15px' />
                </div>
            }
            {
                activeServer.showEventPayload
                ||
                <div
                    className='clickable d-inline-block'
                    onClick={ () => reduxDispatch(switchShowEventPayloadCommand()) }
                >
                    <FileEarmarkCode width='15px' height='15px' />
                </div>
            }
        </div>
    );
};

export default ActiveServerToolboxPresentational;
