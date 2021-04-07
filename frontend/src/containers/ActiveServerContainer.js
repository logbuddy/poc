import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { closeActiveServerCommand } from '../redux/reducers/activeServer';

class ActiveServerContainer extends Component {
    render() {
        if (this.props.reduxState.activeServer.server.id === null) {
            return (<Redirect to='/servers/' />);
        }

        return (
            <Fragment>
                <div>
                    <button
                        className='btn btn-warning'
                        onClick={() => this.props.dispatch(closeActiveServerCommand())}
                    >
                        Close
                    </button>
                </div>
                <h1>
                    {this.props.reduxState.activeServer.server.title}
                </h1>
                {this.props.reduxState.activeServer.server.id}
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(ActiveServerContainer);
