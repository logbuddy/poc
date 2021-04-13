import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { DiscFill } from 'react-bootstrap-icons';
import ServerEventPresentational from '../presentationals/ServerEventPresentational';
import PaginatorPresentational from '../presentationals/PaginatorPresentational';
import {
    changeCurrentEventsResultPageCommand, cycleLogEventsPresentationModeCommand,
    loadEventIntoStructuredDataExplorerCommand, LOG_EVENTS_PRESENTATION_MODE_DEFAULT,
    retrieveEventsCommand, switchPollForYetUnseenEventsCommand
} from '../redux/reducers/activeServer';
import { ConnectedComponentProps } from '../redux/store';
import { ServerEvent } from '../redux/reducers/servers';


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


interface ReactState {
    mouseIsOnDisableShowEventPayloadElement: boolean,
    mouseIsOnEnableShowEventPayloadElement: boolean,
    filterText: string
}

class ServerEventsPanelContainer extends Component<ConnectedComponentProps, ReactState> {
    constructor(props: ConnectedComponentProps) {
        super(props);

        this.state = {
            mouseIsOnDisableShowEventPayloadElement: false,
            mouseIsOnEnableShowEventPayloadElement: false,
            filterText: ''
        };
    }

    componentDidMount() {
        this.props.dispatch(retrieveEventsCommand());
    }

    handlePageClicked = (page: number) => {
        this.props.dispatch(changeCurrentEventsResultPageCommand(page));
    }

    handleChangeFilterText = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            ...this.state,
            filterText: event.target.value
        });
        this.props.dispatch(changeCurrentEventsResultPageCommand(1));
    }


    render() {
        const activeServer = this.props.reduxState.activeServer;
        const server = activeServer.server;


        const filteredEvents = (events: Array<ServerEvent>) => events
            .filter((event) =>
                textMatchesSearchterm(
                    `${event.createdAt} ${event.source} ${event.payload}`,
                    this.state.filterText
                )
            )
        ;

        const filteredEventsForCurrentPage = (events: Array<ServerEvent>) => filteredEvents(events)
            .slice(
                (this.props.reduxState.activeServer.currentEventsResultPage - 1) * itemsPerPage,
                (this.props.reduxState.activeServer.currentEventsResultPage - 1) * itemsPerPage + itemsPerPage
            )
        ;

        const serverEventPresentationalElements = [];
        for (let event of filteredEventsForCurrentPage(server.events)) {
            serverEventPresentationalElements.push(
                <Fragment key={event.id}>
                    <ServerEventPresentational
                        event={event}
                        serverType={server.type}
                        showPayload={this.props.reduxState.activeServer.showEventPayload}
                        onClick={ () => this.props.dispatch(loadEventIntoStructuredDataExplorerCommand(event)) }
                        presentationMode={this.props.reduxState.activeServer.logEventsPresentationMode}
                    />
                    {
                        this.props.reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                        &&
                        <hr className='mb-4'/>
                    }
                    {
                        this.props.reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
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
                            value={this.state.filterText}
                            onChange={
                                (event) =>
                                    this.handleChangeFilterText(event)
                            }
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
                            currentPage={this.props.reduxState.activeServer.currentEventsResultPage}
                            onPageClicked={ (page: number) => this.handlePageClicked(page) }
                        />
                    }
                </div>

                <div>
                    <div
                        className='me-3 text-end tiny'
                    >
                        <div
                            className='d-inline-block clickable me-3 border-1 border-bottom border-secondary pb-1'
                            onClick={ () => this.props.dispatch(cycleLogEventsPresentationModeCommand()) }
                        >
                            {
                                this.props.reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                                &&
                                'Default view'
                            }
                            {
                                this.props.reduxState.activeServer.logEventsPresentationMode === LOG_EVENTS_PRESENTATION_MODE_DEFAULT
                                ||
                                'Compact view'
                            }
                        </div>

                        <div
                            className='d-inline-block clickable border-1 border-bottom border-secondary pb-1'
                            onClick={ () => this.props.dispatch(switchPollForYetUnseenEventsCommand()) }
                        >
                            {
                                this.props.reduxState.activeServer.pollForYetUnseenEvents
                                &&
                                <span>
                                    Polling for new events...
                                    <DiscFill className='spinning spinning-small text-primary' />
                                </span>
                            }
                            {
                                this.props.reduxState.activeServer.pollForYetUnseenEvents
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
                            currentPage={this.props.reduxState.activeServer.currentEventsResultPage}
                            onPageClicked={ (page: number) => this.handlePageClicked(page) }
                        />
                    </div>
                }
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
    // @ts-ignore
)(ServerEventsPanelContainer);
