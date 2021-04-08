import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { X } from 'react-bootstrap-icons';
import {
    closeActiveServerCommand, retrieveEventsCommand,
    selectedTimelineIntervalsUpdatedEvent, switchExamplePanelCommand, switchInformationPanelCommand
} from '../redux/reducers/activeServer';
import ServerTimelinePresentational from '../presentationals/ServerTimelinePresentational';
import { DatetimeHelper } from 'herodot-shared';
import ServerInformationPanelContainer from './ServerInformationPanelContainer';
import ServerExamplePanelPresentational from "../presentationals/ServerExamplePanelPresentational";
import ServerEventsPanelContainer from "./ServerEventsPanelContainer";
import {
    enableSkipRetrieveYetUnseenServerEventsOperationsCommand,
    resetActiveStructuredDataExplorerAttributesCommand, resetServerEventsByCommand
} from "../redux/reducers/servers";

class ActiveServerContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mouseIsOnDisableShowEventPayloadElement: false,
            mouseIsOnEnableShowEventPayloadElement: false,
            eventLoadedInStructuredDataExplorer: null,
        };
        this.copyElements = {};
    }

    handleLoadEventIntoStructuredDataExplorerClicked = (event, reset = false) => {
        this.props.dispatch(enableSkipRetrieveYetUnseenServerEventsOperationsCommand(event.serverId));
        if (reset) {
            this.props.dispatch(resetActiveStructuredDataExplorerAttributesCommand(event.serverId));
            this.props.dispatch(resetServerEventsByCommand());
        }
        this.setState({ ...this.state, eventLoadedInStructuredDataExplorer: event });
    }

    render() {
        if (this.props.reduxState.activeServer.server.id === null) {
            return (<Redirect to='/servers/' />);
        }

        const activeServer = this.props.reduxState.activeServer;

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
                    onChangeCallback={ () => this.props.dispatch(retrieveEventsCommand()) }
                />

                <div className='m-2'>
                    <div className={`card bg-dark mt-4`}>
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
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ActiveServerContainer);
