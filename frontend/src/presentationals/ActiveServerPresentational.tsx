import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
// @ts-ignore
import { DatetimeHelper } from 'herodot-shared';
import { ReduxState } from '../redux/reducers/root';
import {
    closeActiveServerCommand,
    closeStructuredDataExplorerCommand,
    retrieveEventsCommand,
    retrieveNumberOfEventsPerHourCommand,
    retrieveStructuredDataExplorerEventsCommand,
    selectedTimelineIntervalsUpdatedEvent,
    switchExamplePanelCommand
} from '../redux/reducers/activeServer';
import { Redirect } from 'react-router-dom';
import ServerTimelinePresentational from './ServerTimelinePresentational';
import StructuredDataExplorerContainer from '../containers/StructuredDataExplorerContainer';
import { X } from 'react-bootstrap-icons';
import ServerInformationPanelContainer from '../containers/ServerInformationPanelContainer';
import ServerExamplePanelPresentational from './ServerExamplePanelPresentational';
import ServerEventsPanelContainer from '../containers/ServerEventsPanelContainer';

const ActiveServerPresentational = () => {

    const reduxState = useSelector((state: ReduxState) => state);
    const reduxDispatch = useDispatch();

    useEffect(() => {
        reduxDispatch(retrieveNumberOfEventsPerHourCommand());
    }, [reduxDispatch]);

    if (reduxState.activeServer.server.id === null) {
        return (<Redirect to='/servers/' />);
    }

    const activeServer = reduxState.activeServer;
    const server = activeServer.server;

    return (
        <Fragment>
            <ServerTimelinePresentational
                initialSelectedTimelineIntervalStart={DatetimeHelper.timelineConfig.selectedTimelineIntervalStart}
                initialSelectedTimelineIntervalEnd={DatetimeHelper.timelineConfig.selectedTimelineIntervalEnd}
                currentSelectedTimelineIntervalStart={activeServer.selectedTimelineIntervalStart}
                currentSelectedTimelineIntervalEnd={activeServer.selectedTimelineIntervalEnd}
                timelineIntervalStart={activeServer.timelineIntervalStart}
                timelineIntervalEnd={activeServer.timelineIntervalEnd}
                numberOfEventsPerHour={server.numberOfEventsPerHour}
                onUpdateCallback={ (start: Date, end: Date) => reduxDispatch(selectedTimelineIntervalsUpdatedEvent(start, end)) }
                onChangeCallback={ () => {
                    reduxDispatch(retrieveEventsCommand());
                    if (   activeServer.eventLoadedInStructuredDataExplorer !== null
                        && activeServer.activeStructuredDataExplorerAttributes.length > 0
                    ) {
                        reduxDispatch(retrieveStructuredDataExplorerEventsCommand());
                    }
                }}
            />

            {
                activeServer.eventLoadedInStructuredDataExplorer !== null
                &&
                <div className='card bg-dark m-2 mt-4'>
                    <StructuredDataExplorerContainer
                        server={server}
                        event={activeServer.eventLoadedInStructuredDataExplorer}
                        onCloseClicked={ () => reduxDispatch(closeStructuredDataExplorerCommand()) }
                    />
                </div>
            }

            {
                activeServer.eventLoadedInStructuredDataExplorer === null
                &&
                <div className='m-2'>
                    <div className='card bg-dark mt-4'>
                        <div className='card-header border-bottom border-dark'>
                            <div className='row'>
                                <div className='text-primary col server-headline-icon'>
                                    {
                                        (!server.hasOwnProperty('type') || server.type === null || server.type === 'default')
                                        &&
                                        <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                    }
                                    {
                                        server.type === 'dayz'
                                        &&
                                        <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                    }
                                </div>
                                <div className='col server-headline-title'>
                                    <h4 className='mb-0'>
                                        {server.title}
                                    </h4>
                                </div>

                                <div className='col align-content-end'>
                                    <X
                                        className='float-end clickable'
                                        width='36px'
                                        height='36px'
                                        onClick={() => reduxDispatch(closeActiveServerCommand())}
                                    />
                                </div>
                            </div>
                        </div>

                        <ServerInformationPanelContainer />

                        <ServerExamplePanelPresentational
                            server={server}
                            isOpen={activeServer.examplePanelIsOpen}
                            onSwitch={() => reduxDispatch(switchExamplePanelCommand())}
                        />

                        <ServerEventsPanelContainer />

                    </div>
                </div>
            }
        </Fragment>
    );
};

export default ActiveServerPresentational;
