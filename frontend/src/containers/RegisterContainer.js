import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ErrorMessagePresentational from "../presentationals/ErrorMessagePresentational";
import { registerAccountCommand } from '../redux/reducers/session';

class RegisterContainer extends Component {
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
        this.props.dispatch(registerAccountCommand(this.state.email, this.state.password));
        event.preventDefault();
    }

    render() {
        if (this.props.reduxState.session.isLoggedIn) {
            return (<Redirect to='/' />);
        }

        if (this.props.reduxState.session.justFinishedRegistration) {
            return (<Redirect to='/login' />);
        }

        return (
            <Fragment>
                {
                    this.props.reduxState.session.registration.justFinishedSuccessfully
                    &&
                    <Redirect to='/login' />
                }

                {
                    this.props.reduxState.session.registration.justFinishedSuccessfully
                    ||
                    <div className='container-fluid ps-4 mt-4'>
                        <div className='row'>
                            <div className='col-xs-auto col-sm-12 col-md-8 col-lg-6 col-xl-4'>
                                <h1>Registration</h1>
                                <ErrorMessagePresentational message={this.props.reduxState.session.registration.errorMessage} />
                                <form onSubmit={this.handleSubmit} className='mt-4'>
                                    <div className="mb-4">
                                        <input className='form-control' type='text' name='name' placeholder='E-Mail' value={this.state.email} onChange={this.handleChangeEmail} />
                                    </div>
                                    <div className="mb-4">
                                        <input className='form-control' type='password' name='password' placeholder='Password' value={this.state.password} onChange={this.handleChangePassword} />
                                    </div>
                                    <div className="mt-4 mb-3">
                                        {
                                            this.props.reduxState.session.registration.isRunning
                                            &&
                                            <button className='btn btn-warning disabled'>Processing registration...</button>
                                        }
                                        {
                                            this.props.reduxState.session.registration.isRunning
                                            ||
                                            <button className='btn btn-primary' type='submit'>Register</button>
                                        }
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(RegisterContainer);
