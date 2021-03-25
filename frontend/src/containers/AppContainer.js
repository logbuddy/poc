import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    HashRouter as Router,
    Switch,
    Route,
    NavLink
} from 'react-router-dom';
import { PersonCircle, JournalText } from 'react-bootstrap-icons';
import RegisterContainer from './RegisterContainer';
import LoginContainer from './LoginContainer';
import ServersContainer from './ServersContainer';
import { logOutOfAccountCommand } from "../redux/reducers/session";

class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { showLogoutCta: false };
    }


    render() {
        return (
            <Router>
                <div>
                    <nav className='navbar navbar-expand-sm navbar-dark bg-secondary ps-1'>
                        <div className="container-fluid">
                            <ul className='navbar-nav mr-auto'>
                                <li className='nav-item pe-2'>
                                    <NavLink className='nav-link p-0' activeClassName='active' to='/'>
                                        <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1' alt='LogBuddy Icon' />
                                    </NavLink>
                                </li>
                                {
                                    this.props.reduxState.session.isLoggedIn
                                    ||
                                    <Fragment>
                                        <li className='nav-item'>
                                            <NavLink className='nav-link' activeClassName='active' to='/login'>Login</NavLink>
                                        </li>
                                        {
                                            this.props.reduxState.session.registration.justFinishedSuccessfully
                                            ||
                                            <li className='nav-item'>
                                                <NavLink className='nav-link' activeClassName='active' to='/register'>Register</NavLink>
                                            </li>
                                        }
                                    </Fragment>
                                }

                                {
                                    this.props.reduxState.session.isLoggedIn
                                    &&
                                    <li className='nav-item'>
                                        <NavLink className='nav-link' activeClassName='active' to='/servers/'>
                                            My servers
                                        </NavLink>
                                    </li>
                                }
                            </ul>

                            {
                                this.props.reduxState.session.isLoggedIn
                                &&
                                <ul className="navbar-nav ml-auto">
                                    {
                                        this.state.showLogoutCta
                                        ||
                                        <li
                                            id='loggedin-user-badge'
                                            className='nav-item text-end btn btn-outline-light btn-disabled text-light'
                                            onClick={
                                                () => {
                                                    this.setState({ ...this.state, showLogoutCta: true });
                                                    setTimeout(() => this.setState({ ...this.state, showLogoutCta: false }), 5000);
                                                }
                                            }
                                        >
                                            <PersonCircle />
                                            &nbsp;
                                            {this.props.reduxState.session.loggedInEmail}
                                        </li>
                                    }
                                    {
                                        this.state.showLogoutCta
                                        &&
                                        <li
                                            className='nav-item text-end btn btn-outline-danger'
                                            onClick={ () => this.props.dispatch(logOutOfAccountCommand()) }
                                        >
                                            Log out?
                                        </li>
                                    }
                                </ul>
                            }
                        </div>
                    </nav>

                    <Switch>
                        <Route path='/login'>
                            <LoginContainer />
                        </Route>
                        <Route path='/register'>
                            <RegisterContainer />
                        </Route>
                        <Route path='/servers/'>
                            <ServersContainer />
                        </Route>
                        <Route exact path='/'>
                            <div className='m-0 text-center bg-deepdark'>
                                <div className='card card-body bg-deepdark p-5'>
                                    <div className='mb-3'>
                                        <img src='assets/images/logbuddy-logo.png' width='300' alt='LogBuddy Logo'/>
                                        <h4 className='text-white-50'>
                                            Put your logs on the web <span className='text-primary'>in no time.</span>
                                        </h4>
                                    </div>
                                    <div className='row-cols-lg-2'>
                                        <div className='card card-body mt-4 p-4 pb-2 bg-white text-dark p-2 ms-auto me-auto'>
                                            <p className='line-space-2'>
                                                LogBuddy is at your side whenever you need to quickly <span className='bg-success text-white p-1'>put your log files online</span> in real-time,
                                                allowing you to <span className='bg-success text-white p-1'>easily share and analyze</span> the output of your applications and services.
                                            </p>
                                        </div>
                                    </div>

                                    <div className='row-cols-lg-2'>
                                        <div className='card card-body mt-4 p-4 pb-2 bg-secondary p-2 ms-auto me-auto'>
                                            <p>
                                                Start now by setting up your first server:
                                            </p>
                                            <p className='bg-dark rounded p-1 pt-0'>
                                                <code className='tiny text-success'>
                                                      bash -c "$(curl -fsSL https://raw.githubusercontent.com/logbuddy/bash-clients/main/src/sl-install)"
                                                </code>
                                            </p>
                                            <p>
                                                No need to register here first - the above CLI command takes care of that.
                                            </p>
                                            <p>
                                                Running the above command on your server will guide you through setting
                                                up your LogBuddy account and will enable your server to send whatever log file
                                                output you like into that account, making your log file content available on
                                                the web in real-time.
                                            </p>
                                            <p>
                                                The setup script doesn't need any kind of root access on your server, and
                                                you can always check out its source code
                                                at <a className='text-white' href='https://github.com/logbuddy/bash-clients/tree/main/src'>GitHub.com</a>.
                                            </p>
                                            <p>
                                                Here's how a CLI setup session actually looks like (click to enlarge):
                                            </p>
                                            <p>
                                                <a href='/assets/images/logbuddy-cli-session-full.png'>
                                                    <img src='/assets/images/logbuddy-cli-session-small.png' className='w-100' alt='LogBuddy Logo'/>
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Route>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
)(AppContainer);
