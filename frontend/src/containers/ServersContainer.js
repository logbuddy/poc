import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    Redirect
} from 'react-router-dom';
import { Cpu, Square, ArrowClockwise, Clipboard } from 'react-bootstrap-icons';
import { createServerCommand, retrieveServerListCommand } from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'

const mapStateToProps = state => ({
    reduxState: {...state}
});

const mapDispatchToProps = dispatch => ({
    retrieveServerList: () => dispatch(retrieveServerListCommand()),
    createServer: (title) => dispatch(createServerCommand(title))
});

class ServersContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { createServerTitle: '' };
        this.handleRefreshClicked = this.handleRefreshClicked.bind(this);
        this.handleChangeCreateServerTitle = this.handleChangeCreateServerTitle.bind(this);
        this.handleCreateServerClicked = this.handleCreateServerClicked.bind(this);
    }

    handleRefreshClicked() {
        this.props.retrieveServerList();
    }

    handleChangeCreateServerTitle(event) {
        this.setState({ createServerTitle: event.target.value });
    }

    handleCreateServerClicked() {
        this.props.createServer(this.state.createServerTitle);
        this.setState({ createServerTitle: '' });
    }

    componentDidMount() {
        this.props.retrieveServerList();
    }

    render() {
        if (!this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/login' />);
        }

        const serverListElements = [];
        for (let i=0; i < this.props.reduxState.servers.serverList.length; i++) {
            const serverEventElements = [];
            for (let j=0; j < this.props.reduxState.servers.serverList[i].events.length; j++) {
                serverEventElements.push(
                    <tr key={j}>
                        <td>
                            <span className='badge bg-secondary'>
                                {this.props.reduxState.servers.serverList[i].events[j].createdAt}
                            </span>
                        </td>
                        <td>
                            {this.props.reduxState.servers.serverList[i].events[j].source}
                        </td>
                        <td>
                            <code className='word-wrap-anywhere'>{this.props.reduxState.servers.serverList[i].events[j].payload}</code>
                        </td>
                    </tr>
                );
            }

            const curlSampleCommand = `curl \\
  -X POST \\
  "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \\
  -d '{ "userId": "${this.props.reduxState.servers.serverList[i].userId}",
        "apiKeyId": "${this.props.reduxState.servers.serverList[i].apiKeyId}",
        "serverId": "${this.props.reduxState.servers.serverList[i].id}",
        "events": [{
                     "createdAt": "2021-03-15T17:40:02Z",
                     "source":
                     "curl",
                     "payload": "This is a test."
                   }]}'`;

            serverListElements.push(
                <div key={i} className={`card mt-4 ${this.props.reduxState.servers.retrieveServerList.isProcessing ? 'opacity-25' : 'fade-in'}`}>
                    <div className='card-header'>
                        <h4>
                            <span className='text-success'>
                                <Cpu />
                            </span>
                            &nbsp;
                            {this.props.reduxState.servers.serverList[i].title}
                        </h4>
                    </div>
                    <div className='card-body'>
                        <h5>Information</h5>

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

                        <hr/>

                        <h5>Sample <i>curl</i> command</h5>
                        <code><pre>{curlSampleCommand}</pre>

                        </code>

                        {
                            serverEventElements.length > 0
                            &&
                            <Fragment>
                                <hr/>
                                <h5>Events</h5>
                                <table className='table table-light table-borderless table-striped'>
                                    <tbody>
                                    {serverEventElements}
                                    </tbody>
                                </table>
                            </Fragment>
                        }
                    </div>
                </div>
            );
        }

        return (
            <div className='m-4'>
                <div className='text-end'>
                    <Fragment>
                        {
                            this.props.reduxState.servers.retrieveServerList.isProcessing
                            &&
                            <Square className={`${this.props.reduxState.servers.retrieveServerList.isProcessing ? 'spinning' : 'spinning not-spinning'}`} />
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
                            <button type='submit' className={`btn btn-primary ${(this.state.createServerTitle.length > 0 ? '' : 'disabled')}`}>Add</button>
                        }
                    </div>
                </form>

                {serverListElements}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServersContainer);
