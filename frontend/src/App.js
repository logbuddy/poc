import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink
} from 'react-router-dom';
import RegisterContainer from './containers/RegisterContainer';
import LoginContainer from './containers/LoginContainer';

function App() {
  return (
    <Router>
        <div>
            <nav className='navbar navbar-expand-sm navbar-light bg-light'>
                <div className="container-fluid">
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <NavLink className='nav-link' activeClassName='active' to='/'>Home</NavLink>
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
                    <div>Home</div>
                </Route>
            </Switch>
        </div>
    </Router>
  );
}

export default App;
