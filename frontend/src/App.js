import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink
} from 'react-router-dom';
import RegisterContainer from './containers/RegisterContainer';
import LoginContainer from './containers/LoginContainer';

const mapStateToProps = state => ({
    reduxState: {...state}
});

class App  extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <div>
                    <nav className='navbar navbar-expand-sm navbar-light bg-light'>
                        <div className="container-fluid">
                            <ul className='navbar-nav'>
                                <li className='nav-item'>
                                    <NavLink className='nav-link' activeClassName='active' to='/'>
                                        <strong>Home</strong>
                                    </NavLink>
                                </li>
                                <li className='nav-item'>
                                    <NavLink className='nav-link' activeClassName='active' to='/login'>Login</NavLink>
                                </li>
                                <li className='nav-item'>
                                    <NavLink className='nav-link' activeClassName='active' to='/register'>Register</NavLink>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <Switch>
                        <Route path='/login'>
                            <LoginContainer />
                        </Route>
                        <Route path='/register'>
                            <RegisterContainer />
                        </Route>
                        <Route exact path='/'>
                            <div className='m-4'>
                                <h1>
                                    Welcome to the GameLoggers PoC.
                                </h1>
                            </div>
                        </Route>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default connect()(App);
