import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Redirect
} from 'react-router-dom';
import { Server } from 'react-bootstrap-icons';
import { retrieveServerList } from '../redux/reducers/servers';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'

const mapStateToProps = state => ({
    reduxState: {...state}
});

const mapDispatchToProps = dispatch => ({
    retrieveServerList: () => dispatch(retrieveServerList())
});

class ServersContainer extends Component {
    constructor(props) {
        super(props);
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
                    <tr>
                        <td>
                            <span className='badge bg-secondary'>
                                {this.props.reduxState.servers.serverList[i].events[j].createdAt}
                            </span>
                        </td>
                        <td>
                            {this.props.reduxState.servers.serverList[i].events[j].source}
                        </td>
                        <td>
                            <code>{this.props.reduxState.servers.serverList[i].events[j].payload}</code>
                        </td>
                    </tr>
                );
            }
            serverListElements.push(
                <div className='card mt-4'>
                    <div className='card-header'>
                        <h4>
                            <span className='text-success'>
                                <Server />
                            </span>
                            &nbsp;
                            {this.props.reduxState.servers.serverList[i].title}
                        </h4>
                    </div>
                    <div className='card-body'>
                        <span className='small'>
                            <pre>serverId: {this.props.reduxState.servers.serverList[i].id}</pre>
                            <pre>userId: {this.props.reduxState.servers.serverList[i].userId}</pre>
                            <pre>apiKeyId: {this.props.reduxState.servers.serverList[i].apiKeyId}</pre>
                        </span>
                        <hr/>
                        <table className='table table-light table-borderless table-striped'>
                            <tbody>
                                {serverEventElements}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className='m-4'>
                <h1>My servers</h1>
                <ErrorMessagePresentational message={this.props.reduxState.servers.retrieveServerList.errorMessage} />

                {
                    this.props.reduxState.servers.retrieveServerList.isProcessing
                    &&
                    <div className='card mt-4'>
                        <div className='card-header'>
                            <h4>Please wait</h4>
                        </div>
                        <div className='card-body'>
                            <span className='small'>
                                <pre>Retrieving server list...</pre>
                            </span>
                        </div>
                    </div>
                }

                {serverListElements}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServersContainer);
