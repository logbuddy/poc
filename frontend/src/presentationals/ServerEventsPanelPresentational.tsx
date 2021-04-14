import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { ReduxState } from '../redux/reducers/root';
import {
    changeCurrentEventsResultPageCommand,
    cycleLogEventsPresentationModeCommand,
    loadEventIntoStructuredDataExplorerCommand,
    LOG_EVENTS_PRESENTATION_MODE_DEFAULT,
    retrieveEventsCommand, switchPollForYetUnseenEventsCommand
} from '../redux/reducers/activeServer';
import { ServerEvent } from '../redux/reducers/servers';
import ServerEventPresentational from './ServerEventPresentational';
import PaginatorPresentational from './PaginatorPresentational';
import { DiscFill } from 'react-bootstrap-icons';

const itemsPerPage = 25;

const textMatchesSearchterm = (text: string, searchterm: string) => {
    const buildRegEx = (str: string, keywords: string): RegExp => {
        return new RegExp("(?=.*?\\b" +
            keywords
                .split(" ")
                .join(")(?=.*?\\b") +
            ").*",
            "i"
        );
    }

    const test = (str: string, keywords: string, expected: boolean) => {
        return buildRegEx(str, keywords).test(str) === expected
    }

    if (searchterm.substr(0, 1) === '!') {
        return test(text, searchterm.substr(1), false);
    } else {
        return test(text, searchterm, true);
    }
};

const ServerEventsPanelPresentational = () => {

    const reduxState = useSelector((state: ReduxState) => state);
    const reduxDispatch = useDispatch();

    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        reduxDispatch(retrieveEventsCommand());
    }, [reduxDispatch]);

    const activeServer = reduxState.activeServer;
    const server = activeServer.server;


    const filteredEvents = (events: Array<ServerEvent>) => events
        .filter((event) =>
            textMatchesSearchterm(
                `${event.createdAt} ${event.source} ${event.payload}`,
                filterText
            )
        )
    ;

    const filteredEventsForCurrentPage = (events: Array<ServerEvent>) => filteredEvents(events)
        .slice(
            (activeServer.currentEventsResultPage - 1) * itemsPerPage,
            (activeServer.currentEventsResultPage - 1) * itemsPerPage + itemsPerPage
        )
    ;

    const serverEventPresentationalElements = [];
    for (let event of filteredEventsForCurrentPage(server.events)) {
        serverEventPresentationalElements.push(
            <Fragment key={event.id}>
                <ServerEventPresentational
                    event={event}
                    serverType={server.type}
                    showPayload={activeServer.showEventPayload}
                    onClick={ () => reduxDispatch(loadEventIntoStructuredDataExplorerCommand(event)) }
                    presentationMode={activeServer.logEventsPresentationMode}
                />
                {
                    activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                    &&
                    <hr className='mb-4'/>
                }
                {
                    activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                    ||
                    <div className='mb-2'/>
                }
            </Fragment>
        );
    }

    return (
        <Fragment>
            <h2 className='m-3'>
                Log events
            </h2>

            <div className='card-body rounded p-0 ms-3 me-3 mb-3'>
                <div className='input-group'>
                    <div className='input-group-text bg-dark border-dark'>Filter events</div>
                    <input
                        type='text'
                        className='form-control bg-secondary text-white-50 border-dark'
                        id='filter-events-input'
                        placeholder=''
                        value={filterText}
                        onChange={ e => setFilterText(e.target.value) }
                    />
                </div>
            </div>

            <div className='card-body bg-deepdark rounded p-2 ms-3 me-3 mb-3'>
                {
                    (filteredEvents(server.events).length === 0 && !activeServer.retrieveEventsOperation.isRunning)
                    &&
                    <span>Not matching events. Try changing the filter and timerange.</span>
                }
                {
                    activeServer.retrieveEventsOperation.isRunning
                    &&
                    <span>Retrieving log events...</span>
                }
                {
                    (activeServer.retrieveEventsOperation.isRunning || filteredEvents(server.events).length === 0)
                    ||
                    <PaginatorPresentational
                        numberOfItems={filteredEvents(server.events).length}
                        itemsPerPage={itemsPerPage}
                        currentPage={reduxState.activeServer.currentEventsResultPage}
                        onPageClicked={ (page: number) => reduxDispatch(changeCurrentEventsResultPageCommand(page)) }
                    />
                }
            </div>

            <div>
                <div
                    className='me-3 text-end tiny'
                >
                    <div
                        className='d-inline-block clickable me-3 border-1 border-bottom border-secondary pb-1'
                        onClick={ () => reduxDispatch(cycleLogEventsPresentationModeCommand()) }
                    >
                        {
                            reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                            &&
                            'Default view'
                        }
                        {
                            reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                            ||
                            'Compact view'
                        }
                    </div>

                    <div
                        className='d-inline-block clickable border-1 border-bottom border-secondary pb-1'
                        onClick={ () => reduxDispatch(switchPollForYetUnseenEventsCommand()) }
                    >
                        {
                            reduxState.activeServer.pollForYetUnseenEvents
                            &&
                            <span>
                                    Polling for new events...
                                    <DiscFill className='spinning spinning-small text-primary' />
                                </span>
                        }
                        {
                            reduxState.activeServer.pollForYetUnseenEvents
                            ||
                            <span className='text-white-50'>
                                    Not polling for new events.
                                </span>
                        }
                    </div>
                </div>
            </div>

            {
                (activeServer.retrieveEventsOperation.isRunning || filteredEvents(server.events).length === 0)
                ||
                <div className='card-body bg-dark pb-0 ms-2 me-2'>
                    {serverEventPresentationalElements}
                </div>
            }

            {
                (filteredEvents(server.events).length > 5 && !activeServer.retrieveEventsOperation.isRunning)
                &&
                <div className='card-body bg-deepdark rounded p-2 ms-3 me-3 mb-3'>
                    <PaginatorPresentational
                        numberOfItems={filteredEvents(server.events).length}
                        itemsPerPage={itemsPerPage}
                        currentPage={reduxState.activeServer.currentEventsResultPage}
                        onPageClicked={ (page: number) => reduxDispatch(changeCurrentEventsResultPageCommand(page)) }
                    />
                </div>
            }
        </Fragment>
    );
};

export default ServerEventsPanelPresentational;
