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
        this.setState({ email: event.target.value, password: this.state.password });
    }

    handleChangePassword = (event) => {
        this.setState({ password: event.target.value, email: this.state.email });
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
                            this.props.reduxState.session.registration.justFinishedSuccessfully
                            &&
                            <div className='alert alert-success'>Registration finished successfully. Please log in.</div>
                        }
                        <h1>Login</h1>
                        <ErrorMessagePresentational message={this.props.reduxState.session.login.errorMessage} />
                        <form onSubmit={this.handleSubmit}>
                            <div className="mb-3">
                                <label className='form-label' htmlFor='email'>
                                    E-Mail:
                                </label>
                                <input className='form-control' type='text' id='email' value={this.state.email} onChange={this.handleChangeEmail} />
                            </div>
                            <div className="mb-3">
                                <label className='form-label' htmlFor='password'>
                                    Password:
                                </label>
                                <input className='form-control' type='password' id='password' value={this.state.password} onChange={this.handleChangePassword} />
                            </div>
                            <div className="mb-3">
                                {
                                    this.props.reduxState.session.login.isRunning
                                    &&
                                    <button className='btn btn-warning disabled'>Processing login...</button>
                                }
                                {
                                    this.props.reduxState.session.login.isRunning
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
