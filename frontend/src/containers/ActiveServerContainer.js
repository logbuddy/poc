import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {FileEarmarkCodeFill, FileEarmarkCode, X} from 'react-bootstrap-icons';
import {
    closeActiveServerCommand,
    closeStructuredDataExplorerCommand,
    retrieveEventsCommand, retrieveNumberOfEventsPerHourCommand,
    retrieveStructuredDataExplorerEventsCommand,
    selectedTimelineIntervalsUpdatedEvent,
    switchExamplePanelCommand, switchShowEventPayloadCommand, switchShowStructuredDataExplorerAttributesCommand,
} from '../redux/reducers/activeServer';
import ServerTimelinePresentational from '../presentationals/ServerTimelinePresentational';
import { DatetimeHelper } from 'herodot-shared';
import ServerInformationPanelContainer from './ServerInformationPanelContainer';
import ServerExamplePanelPresentational from '../presentationals/ServerExamplePanelPresentational';
import ServerEventsPanelContainer from './ServerEventsPanelContainer';
import StructuredDataExplorerContainer from './StructuredDataExplorerContainer';

class ActiveServerContainer extends Component {

    componentDidMount() {
        this.props.dispatch(retrieveNumberOfEventsPerHourCommand());
    }

    render() {
        if (this.props.reduxState.activeServer.server.id === null) {
            return (<Redirect to='/servers/' />);
        }

        const activeServer = this.props.reduxState.activeServer;
        const server = activeServer.server;

        const toolbox = <div className='mt-2 text-white-75'>

            {
                activeServer.eventLoadedInStructuredDataExplorer !== null
                &&
                <Fragment>
                    {
                        activeServer.showStructuredDataExplorerAttributes
                        &&
                        <div
                            className='small clickable d-inline-block'
                            onClick={ () => this.props.dispatch(switchShowStructuredDataExplorerAttributesCommand()) }
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
                            onClick={ () => this.props.dispatch(switchShowStructuredDataExplorerAttributesCommand()) }
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
                    onClick={ () => this.props.dispatch(switchShowEventPayloadCommand()) }
                >
                    <FileEarmarkCodeFill width='15px' height='15px' />
                </div>
            }
            {
                activeServer.showEventPayload
                ||
                <div
                    className='clickable d-inline-block'
                    onClick={ () => this.props.dispatch(switchShowEventPayloadCommand()) }
                >
                    <FileEarmarkCode width='15px' height='15px' />
                </div>
            }
        </div>;

        return (
            <Fragment>
                <ServerTimelinePresentational
                    initialSelectedTimelineIntervalStart={DatetimeHelper.timelineConfig.selectedTimelineIntervalStart}
                    initialSelectedTimelineIntervalEnd={DatetimeHelper.timelineConfig.selectedTimelineIntervalEnd}
                    currentSelectedTimelineIntervalStart={activeServer.selectedTimelineIntervalStart}
                    currentSelectedTimelineIntervalEnd={activeServer.selectedTimelineIntervalEnd}
                    timelineIntervalStart={activeServer.timelineIntervalStart}
                    timelineIntervalEnd={activeServer.timelineIntervalEnd}
                    numberOfEventsPerHour={activeServer.server.numberOfEventsPerHour}
                    onUpdateCallback={ (start, end) => this.props.dispatch(selectedTimelineIntervalsUpdatedEvent(start, end)) }
                    onChangeCallback={ () => {
                        this.props.dispatch(retrieveEventsCommand());
                        if (   activeServer.eventLoadedInStructuredDataExplorer !== null
                            && activeServer.activeStructuredDataExplorerAttributes.length > 0
                        ) {
                            this.props.dispatch(retrieveStructuredDataExplorerEventsCommand());
                        }
                    }}
                    toolbox={toolbox}
                />

                {
                    activeServer.eventLoadedInStructuredDataExplorer !== null
                    &&
                    <div className='card bg-dark m-2 mt-4'>
                        <StructuredDataExplorerContainer
                            server={server}
                            event={activeServer.eventLoadedInStructuredDataExplorer}
                            onCloseClicked={ () => this.props.dispatch(closeStructuredDataExplorerCommand()) }
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
                                            (!activeServer.server.hasOwnProperty('type') || activeServer.server.type === null || activeServer.server.type === 'default')
                                            &&
                                            <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                        }
                                        {
                                            activeServer.server.type === 'dayz'
                                            &&
                                            <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                        }
                                    </div>
                                    <div className='col server-headline-title'>
                                        <h4 className='mb-0'>
                                            {activeServer.server.title}
                                        </h4>
                                    </div>

                                    <div className='col align-content-end'>
                                        <X
                                            className='float-end clickable'
                                            width='36px'
                                            height='36px'
                                            onClick={() => this.props.dispatch(closeActiveServerCommand())}
                                        />
                                    </div>
                                </div>
                            </div>

                            <ServerInformationPanelContainer />

                            <ServerExamplePanelPresentational
                                server={activeServer.server}
                                isOpen={activeServer.examplePanelIsOpen}
                                onSwitch={() => this.props.dispatch(switchExamplePanelCommand())}
                            />

                            <ServerEventsPanelContainer />

                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ActiveServerContainer);
