import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Redirect
} from 'react-router-dom';
import ErrorMessagePresentational from '../presentationals/ErrorMessagePresentational'
import {logIntoAccountCommand} from '../redux/reducers/session';

const mapStateToProps = state => ({
    reduxState: {...state}
});

const mapDispatchToProps = dispatch => ({
    logIntoAccount: (email, password) => dispatch(logIntoAccountCommand(email, password))
});

class LoginContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};
        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeEmail(event) {
        this.setState({ email: event.target.value, password: this.state.password });
    }

    handleChangePassword(event) {
        this.setState({ password: event.target.value, email: this.state.email });
    }

    handleSubmit(event) {
        this.props.logIntoAccount(this.state.email, this.state.password);
        event.preventDefault();
    }

    render() {
        if (this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/servers/' />);
        }

        return (
            <div className='m-4'>
                {
                    this.props.reduxState.session.registration.justFinishedSuccessfully
                    &&
                    <div className='alert alert-success'>Registration finished successfully. Please log in.</div>
                }
                <h1>Login</h1>
                <ErrorMessagePresentational message={this.props.reduxState.session.login.errorMessage} />
                <form onSubmit={this.handleSubmit}>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='name'>
                            E-Mail:
                        </label>
                        <input className='form-control' type='text' name='name' value={this.state.email} onChange={this.handleChangeEmail} />
                    </div>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='password'>
                            Password:
                        </label>
                        <input className='form-control' type='password' name='password' value={this.state.password} onChange={this.handleChangePassword} />
                    </div>
                    <div className="mb-3">
                        {
                            this.props.reduxState.session.login.isProcessing
                            &&
                            <button className='btn btn-warning disabled'>Processing login...</button>
                        }
                        {
                            this.props.reduxState.session.login.isProcessing
                            ||
                            <button className='btn btn-primary' type='submit'>Log in</button>
                        }
                    </div>
                </form>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
