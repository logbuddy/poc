import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ArrowClockwise, Disc } from 'react-bootstrap-icons';
import {
    createServerCommand,
    retrieveServerListCommand,
} from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'
import { makeServerActiveCommand } from '../redux/reducers/activeServer';
import ActiveServerContainer from "./ActiveServerContainer";

class ServersContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createServerTitle: '',
        };
    }

    handleRefreshClicked = () => {
        this.setState({ ...this.state, eventLoadedInStructuredDataExplorer: null });
        this.props.dispatch(retrieveServerListCommand());
    }

    handleChangeCreateServerTitle = (event) => {
        this.setState({ ...this.state, createServerTitle: event.target.value });
    }

    handleCreateServerClicked = (event) => {
        event.preventDefault();
        this.props.dispatch(createServerCommand(this.state.createServerTitle));
        this.setState({ ...this.state, createServerTitle: '' });
    }

    componentDidMount() {
        this.props.dispatch(retrieveServerListCommand());
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        if (this.props.reduxState.activeServer.server.id !== null) {
            return <ActiveServerContainer />;
        }

        const serverListElements = [];
        for (let server of this.props.reduxState.servers.serverList) {
            serverListElements.push(
                <div key={server.id} className={`card bg-dark mt-4`}>
                    <div className='card-header border-bottom border-dark'>
                        <div className='row'>
                            <div className='text-primary col server-headline-icon'>
                                {
                                    server.type === 'dayz'
                                    &&
                                    <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                                }
                                {
                                    server.type === 'default'
                                    &&
                                    <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                                }
                            </div>
                            <div className='col server-headline-title'>
                                <h4
                                    className='mb-0 clickable'
                                    onClick={() => this.props.dispatch(makeServerActiveCommand(server))}
                                >
                                    {server.title}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className='m-0'>
                <div className='m-3'>
                    <div className='navbar navbar-expand me-3'>
                        <ul className='navbar-nav ms-auto'>
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

                    <h1 className='mb-3 ms-3'>
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
