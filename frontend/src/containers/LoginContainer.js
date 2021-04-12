import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'
import { logIntoAccountCommand } from '../redux/reducers/session';

class LoginContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '' };
    }

    handleChangeEmail = (event) => {
        this.setState({ ...this.state, email: event.target.value, password: this.state.password });
    }

    handleChangePassword = (event) => {
        this.setState({ ...this.state, password: event.target.value, email: this.state.email });
    }

    handleSubmit = (event) => {
        this.props.dispatch(logIntoAccountCommand(this.state.email, this.state.password));
        event.preventDefault();
    }

    render() {
        if (this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/servers/' />);
        }

        return (
            <div className='container-fluid ps-4 mt-4'>
                <div className='row'>
                    <div className='col-xs-auto col-sm-12 col-md-8 col-lg-6 col-xl-4'>
                        {
                            this.props.reduxState.session.registrationOperation.justFinishedSuccessfully
                            &&
                            <div className='alert alert-success'>Registration finished successfully. Please log in.</div>
                        }
                        <h1>Login</h1>
                        <ErrorMessagePresentational message={this.props.reduxState.session.loginOperation.errorMessage} />
                        <form onSubmit={this.handleSubmit} className='mt-4'>
                            <div className="mb-4">
                                <input className='form-control' type='text' id='email' placeholder='E-Mail' value={this.state.email} onChange={this.handleChangeEmail} />
                            </div>
                            <div className="mb-4">
                                <input className='form-control' type='password' id='password' placeholder='Password' value={this.state.password} onChange={this.handleChangePassword} />
                            </div>
                            <div className="mt-4">
                                {
                                    this.props.reduxState.session.loginOperation.isRunning
                                    &&
                                    <button className='btn btn-warning disabled'>Processing login...</button>
                                }
                                {
                                    this.props.reduxState.session.loginOperation.isRunning
                                    ||
                                    <button className='btn btn-primary' type='submit'>Log in</button>
                                }
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(LoginContainer);
