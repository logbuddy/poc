import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ArrowClockwise, Clipboard, ChevronRight, ChevronDown, Disc, FileEarmarkCode, FileEarmarkCodeFill, PlayCircle, PauseCircle } from 'react-bootstrap-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { endOfToday, subDays, format, set } from 'date-fns';
import TimeRange from 'react-timeline-range-slider';
import {
    createServerCommand,
    retrieveServerListCommand,
    flipServerListElementOpenCommand,
    flipServerListElementCloseCommand,
    retrieveYetUnseenServerEventsCommand,
    disableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    enableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    resetServerEventsByCommand,
    disableShowEventPayloadCommand,
    enableShowEventPayloadCommand,
    timelineIntervalsUpdatedEvent, timelineIntervalsChangedEvent, resetActiveStructuredDataExplorerAttributesCommand
} from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'
import StructuredDataExplorerContainer from './StructuredDataExplorerContainer';
import DayzEventSkinPresentational from '../presentationals/eventSkins/dayz/DayzEventSkinPresentational';
import PaginatorPresentational from '../presentationals/PaginatorPresentational';

const itemsPerPage = 25;
const now = new Date();

class ServersContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mouseIsOnDisableShowEventPayloadElement: false,
            mouseIsOnEnableShowEventPayloadElement: false,
            createServerTitle: '',
            showCopySuccessBadgeForId: null,
            filterEventsInputTexts: [],
            eventLoadedInStructuredDataExplorer: null,
            currentLatestEventsPages: []
        };
        this.copyElements = {};
    }


    isFlippedOpen = (serverId, elementName) => {
        return this.props.reduxState.servers.serverListOpenElements[elementName].includes(serverId);
    };

    handleRefreshClicked = () => {
        this.setState({ ...this.state, eventLoadedInStructuredDataExplorer: null });
        this.props.dispatch(retrieveServerListCommand());
    }

    handleChangeCreateServerTitle = (event) => {
        this.setState({ ...this.state, createServerTitle: event.target.value });
    }

    handleChangeFilterEventsInputText = (event, serverId) => {
        const filterEventsInputTexts = { ...this.state.filterEventsInputTexts };
        filterEventsInputTexts[serverId] = event.target.value;
        this.setState({ ...this.state, filterEventsInputTexts }, () => this.handleCurrentLatestEventsPageClicked(serverId, 1));
    }

    handleCreateServerClicked = (event) => {
        event.preventDefault();
        this.props.dispatch(createServerCommand(this.state.createServerTitle));
        this.setState({ ...this.state, createServerTitle: '' });
    }

    handleFlipElementOpenClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementOpenCommand(server.id, elementName));
        if (elementName === 'latestEvents') {
            this.props.dispatch(retrieveYetUnseenServerEventsCommand(
                server.id,
                server.latestEventSortValue
            ));
        }
    }

    handleFlipElementCloseClicked = (server, elementName) => {
        this.props.dispatch(flipServerListElementCloseCommand(server.id, elementName));
    }

    copyCodeToClipboard = (id) => {
        const el = this.copyElements[id];
        el.select();
        document.execCommand('copy');
        el.blur();
        this.setState({ ...this.state, showCopySuccessBadgeForId: id });
    }

    handleLoadEventIntoStructuredDataExplorerClicked = (event, reset = false) => {
        this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(event.serverId));
        if (reset) {
            this.props.dispatch(resetActiveStructuredDataExplorerAttributesCommand(event.serverId));
            this.props.dispatch(resetServerEventsByCommand());
        }
        this.setState({ ...this.state, eventLoadedInStructuredDataExplorer: event });
    }

    handleCurrentLatestEventsPageClicked = (serverId, page) => {
        const newState = { ...this.state.currentLatestEventsPages };
        newState[serverId] = page;
        this.setState({
            ...this.state,
            currentLatestEventsPages: { ...newState }
        });
    }

    componentDidMount() {
        this.props.dispatch(retrieveServerListCommand());
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        const getCurrentLatestEventsPage = (serverId) => {
            if (this.state.currentLatestEventsPages.hasOwnProperty(serverId)) {
                return this.state.currentLatestEventsPages[serverId];
            } else {
                return 1;
            }
        }

        const getFilterEventsInputText = (serverId) => {
            if (this.state.filterEventsInputTexts.hasOwnProperty(serverId)) {
                return this.state.filterEventsInputTexts[serverId];
            } else {
                return '';
            }
        }

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

        const createFlipElement = (server, elementName) => {
            const elementNameToHeadline = {
                information: 'Information',
                sampleCurlCommand: 'Sample curl command',
                latestEvents: 'Log entries',
            };
            if (this.isFlippedOpen(server.id, elementName)) {
                const handleFlipElementCloseClicked = this.handleFlipElementCloseClicked;
                return <Fragment>
                    <div>
                        <span className='clickable' onClick={() => handleFlipElementCloseClicked(server, elementName)}>
                            <span className='align-text-top small'>
                                <ChevronDown />
                            </span>
                            &nbsp;
                            { elementNameToHeadline[elementName] }
                            &nbsp;
                            {
                                (elementName === 'latestEvents' && server.latestEvents.length > 0)
                                &&
                                '(' + server.latestEvents.length + ')'
                            }
                            {
                                (elementName === 'latestEvents' && this.props.reduxState.servers.retrieveServerListOperation.isRunning)
                                &&
                                <Disc className='spinning spinning-small' />
                            }
                        </span>
                        {
                            elementName === 'latestEvents'
                            &&
                            <Fragment>
                                <hr className='text-dark'/>
                                <div className='small text-light mb-2'>
                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        &&
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(disableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Not polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PlayCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning not-spinning spinning-small text-white' />
                                        </div>
                                    }

                                    {
                                        this.props.reduxState
                                            .servers
                                            .serverIdsForWhichRetrieveYetUnseenServerEventsOperationsMustBeSkipped
                                            .includes(server.id)
                                        ||
                                        <div
                                            className='clickable'
                                            onClick={() => this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(server.id)) }
                                        >
                                            <span>Polling for new entries</span>
                                            &nbsp;
                                            <span>
                                                <PauseCircle className='latest-events-play-resume-button'/>
                                            </span>
                                            <Disc className='spinning spinning-small text-primary' />
                                        </div>
                                    }
                                </div>
                                <hr className='text-dark'/>
                            </Fragment>
                        }
                    </div>
                </Fragment>
            } else {
                const handleFlipElementOpenClicked = this.handleFlipElementOpenClicked;
                return <div className='clickable' onClick={() => handleFlipElementOpenClicked(server, elementName)}>
                    <span className='small align-text-bottom'>
                        <ChevronRight />
                    </span>
                    &nbsp;
                    { elementNameToHeadline[elementName] }
                    &nbsp;
                    {
                        (elementName === 'latestEvents' && server.latestEvents.length > 0)
                        &&
                        '(' + server.latestEvents.length + ')'
                    }
                    {
                        (elementName === 'latestEvents' && this.props.reduxState.servers.retrieveServerListOperation.isRunning)
                        &&
                        <Disc className='spinning spinning-small' />
                    }
                </div>;
            }
        };

        const serverListElements = [];
        for (let i=0; i < this.props.reduxState.servers.serverList.length; i++) {
            const server = this.props.reduxState.servers.serverList[i];
            const serverId = server.id;
            const filteredLatestEvents = server.latestEvents
                .filter((event) =>
                    textMatchesSearchterm(
                        `${event.createdAt} ${event.source} ${event.payload}`,
                        getFilterEventsInputText(serverId)
                    )
                )
            ;

            const filteredLatestEventsForCurrentPage = filteredLatestEvents
                .slice(
                    (getCurrentLatestEventsPage(server.id) - 1) * itemsPerPage,
                    (getCurrentLatestEventsPage(server.id) - 1) * itemsPerPage + itemsPerPage
                )
            ;

            const serverEventElements = [];
            let index = 0;
            for (let j=0; j < filteredLatestEventsForCurrentPage.length; j++) {
                const event = filteredLatestEventsForCurrentPage[j];
                const createdAt = event.createdAt;
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

                let isExplorable = typeof(parsedPayload) === 'object';

                serverEventElements.push(
                    <Fragment key={index}>
                        <div
                             className={`row mb-3 ${isExplorable && 'clickable'}`}
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
                                        createdAt
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
                                            server.type === 'dayz'
                                            &&
                                            <DayzEventSkinPresentational event={event} />
                                        }
                                        {
                                            this.props.reduxState.servers.showEventPayload
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
                        <div key={j + 'gutter'} className='d-md-none d-sm-block border-top border-dark'>&nbsp;</div>
                    </Fragment>
                );
                index = index + 1;
            }

            const sampleCurlCommand = `curl \\
  -X POST \\
  "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \\
  -d '{ "userId": "${this.props.reduxState.servers.serverList[i].userId}",
        "apiKeyId": "${this.props.reduxState.servers.serverList[i].apiKeyId}",
        "serverId": "${this.props.reduxState.servers.serverList[i].id}",
        "events": [{
                     "createdAt": "'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'",
                     "source": "uptime on '"$(hostname)"'",
                     "payload": "'"$(uptime)"'"
                   }]}'`;

            serverListElements.push(
                <div key={i} className={`card bg-dark mt-4`}>
                    <div className='card-header border-bottom border-dark'>
                        <div className='row'>
                            <div className='text-primary col server-headline-icon'>
                                {
                                    this.props.reduxState.servers.serverList[i].type === 'dayz'
                                    &&
                                    <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                }
                                {
                                    this.props.reduxState.servers.serverList[i].type === 'default'
                                    &&
                                    <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                }
                            </div>
                            <div className='col server-headline-title'>
                                <h4 className='mb-0'>
                                    {this.props.reduxState.servers.serverList[i].title}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className='card-body bg-dark'>
                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'information') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'information')
                            &&
                            <Fragment>
                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>serverId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].id}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'id'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'id'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => {
                                                    this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'id');
                                                }}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>userId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].userId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'userId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'userId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'userId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em border border-dark bg-secondary text-light'>apiKeyId</div>
                                            <input
                                                type='text'
                                                className='form-control text-primary code border border-dark bg-dark'
                                                value={this.props.reduxState.servers.serverList[i].apiKeyId}
                                                readOnly={true}
                                                disabled={false}
                                                ref={(element) => this.copyElements[this.props.reduxState.servers.serverList[i].id + 'apiKeyId'] = element}
                                            />
                                            {
                                                this.state.showCopySuccessBadgeForId === this.props.reduxState.servers.serverList[i].id + 'apiKeyId'
                                                &&
                                                <div className='input-group-text border border-dark bg-secondary text-primary fade-out-half'>
                                                    <small>
                                                        Copied to clipboard
                                                    </small>
                                                </div>
                                            }
                                            <div
                                                className='btn btn-outline-secondary input-group-text text-light'
                                                onClick={() => this.copyCodeToClipboard(this.props.reduxState.servers.serverList[i].id + 'apiKeyId')}
                                            >
                                                <Clipboard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </Fragment>
                        }


                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'sampleCurlCommand') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'sampleCurlCommand')
                            &&
                            <Fragment>
                                <div className='mb-2 mt-2 bg-deepdark pt-2 ps-4 pe-3 rounded border border-dark border-3'>
                                    <code><pre>{sampleCurlCommand}</pre></code>
                                </div>
                                <hr/>
                            </Fragment>
                        }

                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'latestEvents') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            <div className='container-fluid bg-deepdark rounded border border-dark border-3'>
                                {
                                    (
                                        this.state.eventLoadedInStructuredDataExplorer !== null
                                        && this.state.eventLoadedInStructuredDataExplorer.serverId === serverId
                                    )
                                    &&
                                    <StructuredDataExplorerContainer
                                        server={this.props.reduxState.servers.serverList[i]}
                                        event={this.state.eventLoadedInStructuredDataExplorer}
                                        onCloseClicked={
                                            () => this.setState({ ...this.state, eventLoadedInStructuredDataExplorer: null })
                                        }
                                        onUseEventClicked={(event) =>
                                            this.handleLoadEventIntoStructuredDataExplorerClicked(event)
                                        }
                                    />
                                }

                                {
                                    (
                                        this.state.eventLoadedInStructuredDataExplorer === null
                                        ||
                                        this.state.eventLoadedInStructuredDataExplorer.serverId !== serverId
                                    )
                                    &&
                                    <Fragment>
                                        <div key='filters' className='row'>
                                            <div className='col ps-0 pe-0 ms-1 me-1 mb-2 mt-1'>
                                                <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                                                <div className='input-group'>
                                                    <div className='input-group-text bg-dark border-dark'>Filter events</div>
                                                    <input
                                                        type='text'
                                                        className='form-control bg-secondary text-white-50 border-dark'
                                                        id='filter-events-input'
                                                        placeholder=''
                                                        value={getFilterEventsInputText(this.props.reduxState.servers.serverList[i].id)}
                                                        onChange={
                                                            (event) =>
                                                                this.handleChangeFilterEventsInputText(event, this.props.reduxState.servers.serverList[i].id)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row'>
                                            <div className='col ps-0 pe-0 ms-1 me-1 mb-2 mt-1'>

                                                <PaginatorPresentational
                                                    numberOfItems={filteredLatestEvents.length}
                                                    itemsPerPage={itemsPerPage}
                                                    currentPage={getCurrentLatestEventsPage(server.id)}
                                                    onPageClicked={(page) =>
                                                        this.handleCurrentLatestEventsPageClicked(
                                                            server.id,
                                                            page
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {serverEventElements}

                                        <div className='row'>
                                            <div className='col ps-0 pe-0 ms-1 me-1 mb-2 mt-1'>

                                                <PaginatorPresentational
                                                    numberOfItems={filteredLatestEvents.length}
                                                    itemsPerPage={itemsPerPage}
                                                    currentPage={getCurrentLatestEventsPage(server.id)}
                                                    onPageClicked={(page) =>
                                                        this.handleCurrentLatestEventsPageClicked(
                                                            server.id,
                                                            page
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                    </Fragment>
                                }
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length === 0
                            &&
                            <div className='row-cols-auto mt-3 text-secondary'>
                                No log entries for the selected time range.
                            </div>
                        }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            this.props.reduxState.servers.serverList[i].latestEvents.length > 0
                            &&
                            getFilterEventsInputText(this.props.reduxState.servers.serverList[i].id).length > 0
                            &&
                            serverEventElements.length === 0
                            &&
                            <div className='row-cols-auto mt-3 text-secondary'>
                                No entries match the current filter.
                            </div>
                        }

                    </div>
                </div>
            );
        }

        return (
            <div className='m-0'>
                <div className='w-100 m-0 sticky-top bg-deepdark border-secondary border-bottom border-1 p-2'>
                    <div className='container-fluid'>
                        <div className='row tiny text-secondary'>
                            <div className='col align-self-start'>
                                {format(this.props.reduxState.servers.selectedTimelineIntervalStart, 'PPPP')}
                                <br/>
                                {format(this.props.reduxState.servers.selectedTimelineIntervalStart, 'p')}
                            </div>
                            <div className='col align-self-end text-end'>
                                {format(this.props.reduxState.servers.selectedTimelineIntervalEnd, 'PPPP')}
                                <br/>
                                {format(this.props.reduxState.servers.selectedTimelineIntervalEnd, 'p')}
                            </div>
                        </div>

                    </div>
                    <TimeRange
                        mode={1}
                        error={false}
                        ticksNumber={7}
                        formatTick={(ms) =>
                            `${format(new Date(ms), 'LLL')} ${format(new Date(ms), 'd')}`
                        }
                        step={60*60*1000/4}
                        selectedInterval={[
                            set(subDays(new Date(), 1), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
                            endOfToday()
                        ]}
                        timelineInterval={[
                            set(subDays(now, 7), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
                            endOfToday()
                        ]}
                        onUpdateCallback={ (v) => {
                            this.props.dispatch(timelineIntervalsUpdatedEvent(
                                v.time[0],
                                v.time[1])
                            );
                        }}
                        onChangeCallback={ () => this.props.dispatch(timelineIntervalsChangedEvent()) }
                    />
                </div>

                <div className='m-3'>
                    <div className='navbar navbar-expand'>
                        <ul className='navbar-nav ms-auto'>
                            <li className='nav-item text-center'>
                                {
                                    this.props.reduxState.servers.showEventPayload
                                    &&
                                    <Fragment>
                                        {
                                            this.state.mouseIsOnDisableShowEventPayloadElement
                                            &&
                                            <span className='tiny'>Showing JSON payloads. Click to disable.</span>
                                        }
                                        <FileEarmarkCodeFill
                                            width='1.5em'
                                            height='1.5em'
                                            className='clickable'
                                            onMouseOver={() => this.setState({
                                                ...this.state,
                                                mouseIsOnDisableShowEventPayloadElement: true,
                                                mouseIsOnEnableShowEventPayloadElement: false
                                            })}
                                            onMouseOut={() => this.setState({
                                                ...this.state,
                                                mouseIsOnDisableShowEventPayloadElement: false,
                                                mouseIsOnEnableShowEventPayloadElement: false
                                            })}
                                            onClick={() => this.props.dispatch(disableShowEventPayloadCommand())}
                                        />
                                    </Fragment>
                                }
                                {
                                    this.props.reduxState.servers.showEventPayload
                                    ||
                                    <Fragment>
                                        {
                                            this.state.mouseIsOnEnableShowEventPayloadElement
                                            &&
                                            <span className='tiny'>Not showing JSON payloads. Click to enable.</span>
                                        }
                                        <FileEarmarkCode
                                            width='1.5em'
                                            height='1.5em'
                                            className='clickable'
                                            onMouseOver={() => this.setState({
                                                ...this.state,
                                                mouseIsOnDisableShowEventPayloadElement: false,
                                                mouseIsOnEnableShowEventPayloadElement: true
                                            })}
                                            onMouseOut={() => this.setState({
                                                ...this.state,
                                                mouseIsOnDisableShowEventPayloadElement: false,
                                                mouseIsOnEnableShowEventPayloadElement: false
                                            })}
                                            onClick={() => this.props.dispatch(enableShowEventPayloadCommand())}
                                        />
                                    </Fragment>
                                }
                            </li>
                            <li className='nav-item text-center'>
                                {
                                    this.props.reduxState.servers.retrieveServerListOperation.isRunning
                                    &&
                                    <Disc className={`text-light ${this.props.reduxState.servers.retrieveServerListOperation.isRunning ? 'spinning' : 'spinning not-spinning'}`} />
                                }
                                {
                                    this.props.reduxState.servers.retrieveServerListOperation.isRunning
                                    ||
                                    <span className='clickable' onClick={this.handleRefreshClicked}><ArrowClockwise className='spinning not-spinning' /></span>
                                }
                            </li>
                        </ul>
                    </div>

                    <ErrorMessagePresentational message={this.props.reduxState.servers.retrieveServerListOperation.errorMessage} />

                    <h1 className='mb-3'>
                        My servers
                    </h1>

                    <div className='card card-body bg-dark pt-0'>
                        <form className='row row-cols-sm-auto g-3 mt-2 mb-2' onSubmit={this.handleCreateServerClicked}>
                            <div className='col-12'>
                                <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                                <div className='input-group'>
                                    <div className='input-group-text'>Add server</div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='create-server-title'
                                        placeholder='Name of new server'
                                        value={this.state.createServerTitle}
                                        onChange={this.handleChangeCreateServerTitle}
                                    />
                                </div>
                            </div>

                            <div className='col-12'>
                                {
                                    this.props.reduxState.servers.createServerOperation.isRunning
                                    &&
                                    <button className='float-end btn btn-warning disabled'>Adding...</button>
                                }
                                {
                                    this.props.reduxState.servers.createServerOperation.isRunning
                                    ||
                                    (
                                        (this.state.createServerTitle.length > 0)
                                        &&
                                        <button type='submit' className='float-end btn btn-success fade-in'>Add</button>
                                    )
                                }
                            </div>
                        </form>
                    </div>

                    {
                        serverListElements.length > 0
                        &&
                        serverListElements
                    }

                    {
                        serverListElements.length > 0
                        ||
                        <div className='mt-5 w-100 text-center'>
                            <h1 className='text-secondary'>
                                Loading server data, please wait...
                            </h1>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ServersContainer);
