import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import DayzEventSkinPresentational from "../presentationals/eventSkins/dayz/DayzEventSkinPresentational";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import ServerEventPresentational from "../presentationals/ServerEventPresentational";
import PaginatorPresentational from "../presentationals/PaginatorPresentational";


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
            filterEventsInputText: '',
            eventLoadedInStructuredDataExplorer: null,
            currentPage: 1
        };
    }

    handlePageClicked = (page) => {
        this.setState({
            ...this.state,
            currentPage: page
        });
    }

    handleChangeFilterEventsInputText = (event) => {
        this.setState({
            ...this.state,
            filterEventsInputText: event.target.value,
            currentPage: 1
        });
    }


    render() {
        const activeServer = this.props.reduxState.activeServer;
        const server = activeServer.server;


        const filteredLatestEvents = (events) => events
            .filter((event) =>
                textMatchesSearchterm(
                    `${event.createdAt} ${event.source} ${event.payload}`,
                    this.state.filterEventsInputText
                )
            )
        ;

        const filteredLatestEventsForCurrentPage = (events) => filteredLatestEvents(events)
            .slice(
                (this.state.currentPage - 1) * itemsPerPage,
                (this.state.currentPage - 1) * itemsPerPage + itemsPerPage
            )
        ;

        const serverEventPresentationalElements = [];
        for (let event of filteredLatestEventsForCurrentPage(server.events)) {
            serverEventPresentationalElements.push(
                <Fragment key={event.id}>
                    <ServerEventPresentational
                        event={event}
                        serverType={server.type}
                        showPayload={this.props.reduxState.activeServer.showEventPayload}
                    />
                    <hr className='mb-4'/>
                </Fragment>
            );
        }

        return (
            <Fragment>
                <h2
                    className='m-3 mb-3'>
                    Log events
                </h2>

                <div className='card-body bg-deepdark rounded p-1 ms-3 me-3 mb-3'>
                    <div className='input-group'>
                        <div className='input-group-text bg-dark border-dark'>Filter events</div>
                        <input
                            type='text'
                            className='form-control bg-secondary text-white-50 border-dark'
                            id='filter-events-input'
                            placeholder=''
                            value={this.state.filterEventsInputText}
                            onChange={
                                (event) =>
                                    this.handleChangeFilterEventsInputText(event)
                            }
                        />
                    </div>
                </div>

                <div className='card-body bg-deepdark rounded p-2 ms-3 me-3 mb-3'>
                    {
                        (filteredLatestEvents(server.events).length === 0 && !activeServer.retrieveEventsOperation.isRunning)
                        &&
                        <span>Not matching events. Try changing the filter and timerange.</span>
                    }
                    {
                        activeServer.retrieveEventsOperation.isRunning
                        &&
                        <span>Retrieving log events...</span>
                    }
                    {
                        activeServer.retrieveEventsOperation.isRunning
                        ||
                        <PaginatorPresentational
                            numberOfItems={filteredLatestEvents(server.events).length}
                            itemsPerPage={itemsPerPage}
                            currentPage={this.state.currentPage}
                            onPageClicked={ (page) => this.handlePageClicked(page) }
                        />
                    }
                </div>

                <div className='card-body bg-dark pb-0 ms-2 me-2'>
                    {serverEventPresentationalElements}
                </div>

                {
                    (filteredLatestEvents(server.events).length > 5 && !activeServer.retrieveEventsOperation.isRunning)
                    &&
                    <div className='card-body bg-deepdark rounded p-2 ms-3 me-3 mb-3'>
                        <PaginatorPresentational
                            numberOfItems={filteredLatestEvents(server.events).length}
                            itemsPerPage={itemsPerPage}
                            currentPage={this.state.currentPage}
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
