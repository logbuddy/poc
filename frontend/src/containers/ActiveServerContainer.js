import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
    closeActiveServerCommand, retrieveEventsCommand,
    selectedTimelineIntervalsUpdatedEvent, switchExamplePanelCommand, switchInformationPanelCommand
} from '../redux/reducers/activeServer';
import ServerEventPresentational from '../presentationals/ServerEventPresentational';
import ServerTimelinePresentational from '../presentationals/ServerTimelinePresentational';
import { DatetimeHelper } from 'herodot-shared';
import ServerInformationPanelContainer from './ServerInformationPanelContainer';
import ServerExamplePanelPresentational from "../presentationals/ServerExamplePanelPresentational";

class ActiveServerContainer extends Component {
    render() {
        if (this.props.reduxState.activeServer.server.id === null) {
            return (<Redirect to='/servers/' />);
        }

        const activeServer = this.props.reduxState.activeServer;

        const eventElements = [];
        for (let event of this.props.reduxState.activeServer.server.events) {
            eventElements.push(<ServerEventPresentational key={event.id} serverEvent={event} />);
        }

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
                    <div>
                        <button
                            className='btn btn-warning'
                            onClick={() => this.props.dispatch(closeActiveServerCommand())}
                        >
                            Close
                        </button>
                    </div>

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
                            </div>
                        </div>
                    </div>

                    <ServerInformationPanelContainer />

                    <ServerExamplePanelPresentational
                        server={activeServer.server}
                        isOpen={activeServer.examplePanelIsOpen}
                        onSwitch={() => this.props.dispatch(switchExamplePanelCommand())}
                    />

                    {activeServer.server.id}
                    <div>
                        {eventElements}
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
