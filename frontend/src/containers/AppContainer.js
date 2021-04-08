import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    HashRouter as Router,
    Switch,
    Route,
    NavLink,
    useLocation
} from 'react-router-dom';
import { PersonCircle } from 'react-bootstrap-icons';
import RegisterContainer from './RegisterContainer';
import LoginContainer from './LoginContainer';
import ServersContainer from './ServersContainer';
import { logOutOfAccountCommand } from "../redux/reducers/session";
import ActiveServerContainer from './ActiveServerContainer';

const Navigation = (params) => (
    <Fragment>
        <ul className='navbar-nav me-auto'>
            {
                useLocation().pathname === '/'
                ||
                <li className='nav-item pe-2'>
                    <NavLink className='nav-link p-0' activeClassName='active' to='/'>
                        <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1' alt='LogBuddy Icon' />
                    </NavLink>
                </li>
            }
            {
                params.reduxState.session.isLoggedIn
                &&
                <li className='nav-item'>
                    <NavLink className='nav-link' activeClassName='active' to='/servers/'>
                        My servers
                    </NavLink>
                </li>
            }
        </ul>

        {
            params.reduxState.session.isLoggedIn
            ||
            <ul className='navbar-nav ms-auto'>
                <li className='nav-item'>
                    <NavLink className='nav-link' activeClassName='active' to='/login'>Login</NavLink>
                </li>
                {
                    params.reduxState.session.registration.justFinishedSuccessfully
                    ||
                    <li className='nav-item'>
                        <NavLink className='nav-link' activeClassName='active' to='/register'>Register</NavLink>
                    </li>
                }
            </ul>
        }
    </Fragment>
);

class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { showLogoutCta: false };
    }


    render() {
        return (
            <Router>
                <div>
                    <nav className='navbar navbar-expand navbar-dark bg-secondary ps-1'>
                        <div className="container-fluid">
                            <Navigation reduxState={this.props.reduxState} />
                            {
                                this.props.reduxState.session.isLoggedIn
                                &&
                                <ul className="navbar-nav ms-auto">
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
                        <Route path='/server/'>
                            <ActiveServerContainer />
                        </Route>
                        <Route exact path='/'>
                            <div className='container-fluid'>
                                <div className='row pb-5 pt-5 navbar-dark'>
                                    <div className='col-12 text-center'>
                                        <img src='assets/images/logbuddy-logo.png' width='300' alt='LogBuddy Logo'/>
                                        <h4 className='text-white'>
                                            Put your logs on the web <span className='text-primary'>in no time.</span>
                                        </h4>
                                    </div>
                                </div>
                                <div className='row bg-white bg-gradient-transparent-to-bg-secondary'>
                                    <div className='col-md-6 mt-auto mb-auto'>
                                        <p className='line-space-1-5 text-dark ps-5 pe-5 pt-5 pt-lg-0 pt-md-5 pt-sm-5 h4 d-lg-none'>
                                            LogBuddy is at your side whenever you need to quickly <span className='bg-primary text-white p-1'>put&nbsp;your&nbsp;log&nbsp;files&nbsp;online</span> in real-time,
                                            allowing you to <span className='bg-primary text-white p-1'>easily&nbsp;share&nbsp;and&nbsp;analyze</span> the output of your applications and services.
                                        </p>
                                        <p className='line-space-1-5 text-dark ps-5 pe-5 pt-5 pt-lg-0 pt-md-5 pt-sm-5 h2 d-none d-lg-block d-xxl-none'>
                                            LogBuddy is at your side whenever you need to quickly <span className='bg-primary text-white p-1'>put&nbsp;your&nbsp;log&nbsp;files&nbsp;online</span> in real-time,
                                            allowing you to <span className='bg-primary text-white p-1'>easily&nbsp;share&nbsp;and&nbsp;analyze</span> the output of your applications and services.
                                        </p>
                                        <p className='line-space-1-5 text-dark ps-5 pe-5 pt-5 pt-lg-0 pt-md-5 pt-sm-5 h1 d-none d-xxl-block'>
                                            LogBuddy is at your side whenever you need to quickly <span className='bg-primary text-white p-1'>put&nbsp;your&nbsp;log&nbsp;files&nbsp;online</span> in real-time,
                                            allowing you to <span className='bg-primary text-white p-1'>easily&nbsp;share&nbsp;and&nbsp;analyze</span> the output of your applications and services.
                                        </p>
                                    </div>
                                    <div className='col-md-6 text-end me-0 pe-0 mb-0 pb-0 mt-md-5 align-self-end'>
                                        <img src='assets/images/logbuddy-cli-to-browser-demo.png' className='mw-100' width='90%' alt='LogBuddy CLI to Browser Demo'/>
                                    </div>
                                </div>

                                <div className='row bg-secondary ps-2 pe-2 pt-5 pb-4'>
                                    <div className='col-lg-6 pe-md-5 pb-2 ps-5 pe-5'>
                                        <p>
                                            Start now by setting up your first server:
                                        </p>
                                        <p className='bg-dark rounded p-3 pt-1 pb-2'>
                                            <code className='tiny text-info'>
                                                bash -c "$(curl -fsSL https://raw.githubusercontent.com/logbuddy/bash-clients/main/src/lb-install)"
                                            </code>
                                        </p>
                                        <p>
                                            No need to register on the web first - the above CLI command takes care of that.
                                        </p>
                                    </div>
                                    <div className='col-lg-6 text-center ps-md-5 ps-5 pe-5'>
                                        <div className='bg-dark rounded p-3 pt-1 pb-2'>
                                            <div className='mt-3 mb-3'>
                                                Here is what happens in the CLI
                                            </div>
                                            <a href='/assets/images/logbuddy-cli-session-full.png'>
                                                <img src='/assets/images/logbuddy-cli-session-small.png' className='w-50' alt='LogBuddy Logo'/>
                                            </a>
                                            <div className='small mt-3 mb-3 text-secondary'>
                                                Click to enlarge
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row bg-dark ps-2 pe-2 pt-4 pb-5'>
                                    <div className='col-lg-6 pe-md-5 pb-5 ps-5 pe-5'>
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
                                    </div>
                                    <div className='col-lg-6 text-center ps-md-5'>
                                        &nbsp;
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
