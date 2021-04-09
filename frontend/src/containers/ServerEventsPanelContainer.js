import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { DiscFill } from 'react-bootstrap-icons';
import ServerEventPresentational from '../presentationals/ServerEventPresentational';
import PaginatorPresentational from '../presentationals/PaginatorPresentational';
import {
    changeCurrentEventsResultPageCommand,
    loadEventIntoStructuredDataExplorerCommand,
    retrieveEventsCommand, switchPollForYetUnseenEventsCommand
} from '../redux/reducers/activeServer';


const itemsPerPage = 25;

const textMatchesSearchterm = (text, searchterm) => {
    const buildRegEx = (str, keywords) => {
        return new RegExp("(?=.*?\\b" +
            keywords
                .split(" ")
                .join(")(?=.*?\\b") +
            ").*",
            "i"
        );
    }

    const test = (str, keywords, expected) => {
        return buildRegEx(str, keywords).test(str) === expected
    }

    if (searchterm.substr(0, 1) === '!') {
        return test(text, searchterm.substr(1), false);
    } else {
        return test(text, searchterm, true);
    }
};

class ServerEventsPanelContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mouseIsOnDisableShowEventPayloadElement: false,
            mouseIsOnEnableShowEventPayloadElement: false,
            filterText: '',
            eventLoadedInStructuredDataExplorer: null,
        };
    }

    componentDidMount() {
        this.props.dispatch(retrieveEventsCommand());
    }

    handlePageClicked = (page) => {
        this.props.dispatch(changeCurrentEventsResultPageCommand(page));
    }

    handleChangeFilterText = (event) => {
        this.setState({
            ...this.state,
            filterText: event.target.value
        });
        this.props.dispatch(changeCurrentEventsResultPageCommand(1));
    }


    render() {
        const activeServer = this.props.reduxState.activeServer;
        const server = activeServer.server;


        const filteredEvents = (events) => events
            .filter((event) =>
                textMatchesSearchterm(
                    `${event.createdAt} ${event.source} ${event.payload}`,
                    this.state.filterText
                )
            )
        ;

        const filteredEventsForCurrentPage = (events) => filteredEvents(events)
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
                    />
                    <hr className='mb-4'/>
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
                            onPageClicked={ (page) => this.handlePageClicked(page) }
                        />
                    }
                </div>

                <div
                    className='me-3 text-end tiny'
                >
                    <div
                        className='d-inline-block clickable'
                        onClick={ () => this.props.dispatch(switchPollForYetUnseenEventsCommand()) }
                    >
                        {
                            this.props.reduxState.activeServer.pollForYetUnseenEvents
                            &&
                            <span className='text-white-50'>
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
                            onPageClicked={ (page) => this.handlePageClicked(page) }
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
)(ServerEventsPanelContainer);
