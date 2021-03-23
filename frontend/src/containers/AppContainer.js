import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    HashRouter as Router,
    Switch,
    Route,
    NavLink
} from 'react-router-dom';
import { PersonCircle } from 'react-bootstrap-icons';
import RegisterContainer from './RegisterContainer';
import LoginContainer from './LoginContainer';
import ServersContainer from './ServersContainer';

class AppContainer extends Component {
    render() {
        return (
            <Router>
                <div>
                    <nav className='navbar navbar-expand-sm navbar-dark bg-secondary ps-1'>
                        <div className="container-fluid">
                            <ul className='navbar-nav mr-auto'>
                                <li className='nav-item'>
                                    <NavLink className='nav-link' activeClassName='active' to='/'>
                                        <strong>Home</strong>
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
                                    <li id='loggedin-user-badge' className='nav-item text-end btn btn-outline-light btn-disabled text-light'>
                                        <PersonCircle />
                                        &nbsp;
                                        {this.props.reduxState.session.loggedInEmail}
                                    </li>
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
                            <div className='m-4'>
                                <h1>
                                    Welcome to the ServerLogger proof-of-concept application.
                                </h1>
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
