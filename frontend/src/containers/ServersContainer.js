import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Cpu, ArrowClockwise, Clipboard, ChevronRight, ChevronDown, Disc } from 'react-bootstrap-icons';
import {
    createServerCommand,
    retrieveServerListCommand,
    flipServerListElementOpenCommand,
    flipServerListElementCloseCommand,
    retrieveYetUnseenServerEventsCommand
} from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'

class ServersContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { createServerTitle: '' };
    }

    isFlippedOpen = (serverId, elementName) => {
        return this.props.reduxState.servers.serverListOpenElements[elementName].includes(serverId);
    };

    handleRefreshClicked = () => {
        this.props.dispatch(retrieveServerListCommand());
    }

    handleChangeCreateServerTitle = (event) => {
        this.setState({ createServerTitle: event.target.value });
    }

    handleCreateServerClicked = (event) => {
        event.preventDefault();
        this.props.dispatch(createServerCommand(this.state.createServerTitle));
        this.setState({ createServerTitle: '' });
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

    componentDidMount() {
        this.props.dispatch(retrieveServerListCommand());
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        const createFlipElement = (server, elementName) => {
            const elementNameToHeadline = {
                information: 'Information',
                sampleCurlCommand: 'Sample curl command',
                latestEvents: 'Latest events',
            };
            if (this.isFlippedOpen(server.id, elementName)) {
                const handleFlipElementCloseClicked = this.handleFlipElementCloseClicked;
                return <Fragment>
                    <h5 className='mt-2 clickable' onClick={() => handleFlipElementCloseClicked(server, elementName)}>
                        { elementNameToHeadline[elementName] }
                        &nbsp;
                        <span className='align-text-top'>
                            <ChevronDown />
                        </span>
                        {
                            elementName === 'latestEvents'
                            &&
                            <div className='small float-end text-light mb-2'>
                                Polling for new entries
                                <Disc className='spinning text-info' />
                            </div>
                        }
                    </h5>
                </Fragment>
            } else {
                const handleFlipElementOpenClicked = this.handleFlipElementOpenClicked;
                return <div className='clickable' onClick={() => handleFlipElementOpenClicked(server, elementName)}>
                    { elementNameToHeadline[elementName] }
                    &nbsp;
                    <span className='small align-text-bottom'>
                        <ChevronRight />
                    </span>
                </div>;
            }
        };

        const serverListElements = [];
        for (let i=0; i < this.props.reduxState.servers.serverList.length; i++) {
            const serverEventElements = [];
            for (let j=0; j < this.props.reduxState.servers.serverList[i].latestEvents.length; j++) {
                let rowClassName = '';
                if (   this.props.reduxState.servers.serverList[i].latestEvents[j].hasOwnProperty('hasBeenAddedByYetUnseenLogic')
                    && this.props.reduxState.servers.serverList[i].latestEvents[j].hasBeenAddedByYetUnseenLogic === true
                ) {
                    rowClassName = 'fade-in';
                }
                serverEventElements.push(
                    <tr key={j} className={rowClassName}>
                        <td>
                            <code className='text-light'>
                                {this.props.reduxState.servers.serverList[i].latestEvents[j].createdAt}
                            </code>
                        </td>
                        <td>
                            <span className='badge bg-dark text-success word-wrap-anywhere'>
                                <code>
                                    {this.props.reduxState.servers.serverList[i].latestEvents[j].source}
                                </code>
                            </span>
                        </td>
                        <td>
                            <code className='word-wrap-anywhere text-info'>
                                {this.props.reduxState.servers.serverList[i].latestEvents[j].payload}
                            </code>
                        </td>
                    </tr>
                );
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
                <div key={i} className={`card bg-dark mt-4 ${this.props.reduxState.servers.retrieveServerList.isProcessing ? 'opacity-25' : 'fade-in'}`}>
                    <div className='card-header border-bottom border-secondary'>
                        <div className='row'>
                            <div className='text-info col server-headline-icon'>
                                <Cpu />
                            </div>
                            <div className='col server-headline-title'>
                                <h4 className='mb-0'>{this.props.reduxState.servers.serverList[i].title}</h4>
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
                                            <div className='input-group-text w-6em'>serverId</div>
                                            <input
                                                type='text'
                                                className='form-control text-black-50 code'
                                                value={this.props.reduxState.servers.serverList[i].id}
                                                disabled={false}
                                            />
                                            <div className='input-group-text'><Clipboard /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em'>userId</div>
                                            <input
                                                type='text'
                                                className='form-control text-black-50 code'
                                                value={this.props.reduxState.servers.serverList[i].userId}
                                                disabled={false}
                                            />
                                            <div className='input-group-text'><Clipboard /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row mt-2 mb-2'>
                                    <div className='col-12'>
                                        <div className='input-group'>
                                            <div className='input-group-text w-6em'>apiKeyId</div>
                                            <input
                                                type='text'
                                                className='form-control text-black-50 code'
                                                value={this.props.reduxState.servers.serverList[i].apiKeyId}
                                                disabled={false}
                                            />
                                            <div className='input-group-text'><Clipboard /></div>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        }


                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'sampleCurlCommand')
                            &&
                            <hr/>
                        }
                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'sampleCurlCommand') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'sampleCurlCommand')
                            &&
                            <code><pre>{sampleCurlCommand}</pre></code>
                        }


                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            <hr/>
                        }

                        { createFlipElement(this.props.reduxState.servers.serverList[i], 'latestEvents') }

                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            serverEventElements.length > 0
                            &&
                            <table className='table table-light table-borderless table-striped table-dark'>
                                <tbody>
                                {serverEventElements}
                                </tbody>
                            </table>
                        }
                        {
                            this.isFlippedOpen(this.props.reduxState.servers.serverList[i].id, 'latestEvents')
                            &&
                            serverEventElements.length === 0
                            &&
                            <div className='alert alert-secondary'>
                                No events yet.
                            </div>
                        }
                    </div>
                </div>
            );
        }

        return (
            <div className='m-4'>
                <div className='text-end float-end'>
                    <Fragment>
                        {
                            this.props.reduxState.servers.retrieveServerList.isProcessing
                            &&
                            <Disc className={`text-light ${this.props.reduxState.servers.retrieveServerList.isProcessing ? 'spinning' : 'spinning not-spinning'}`} />
                        }
                        {
                            this.props.reduxState.servers.retrieveServerList.isProcessing
                            ||
                            <span className='clickable' onClick={this.handleRefreshClicked}><ArrowClockwise className='spinning not-spinning' /></span>
                        }
                    </Fragment>
                </div>

                <ErrorMessagePresentational message={this.props.reduxState.servers.retrieveServerList.errorMessage} />

                <h1>
                    My servers
                </h1>

                <div className='card card-body bg-dark pt-0'>
                    <form className='row row-cols-lg-auto g-3 mt-2 mb-2' onSubmit={this.handleCreateServerClicked}>
                        <div className='col-12'>
                            <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                            <div className='input-group'>
                                <div className='input-group-text'>New server</div>
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
                                this.props.reduxState.servers.createServer.isProcessing
                                &&
                                <button className='btn btn-warning disabled'>Adding...</button>
                            }
                            {
                                this.props.reduxState.servers.createServer.isProcessing
                                ||
                                <button type='submit' className={`btn btn-success ${(this.state.createServerTitle.length > 0 ? '' : 'disabled')}`}>Add</button>
                            }
                        </div>
                    </form>
                </div>

                {serverListElements}
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ServersContainer);
