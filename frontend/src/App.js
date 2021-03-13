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
                        <li className='nav-item p-2'>
                            <NavLink to='/'>Home</NavLink>
                        </li>
                        <li className='nav-item p-2'>
                            <NavLink to='/login'>Log in</NavLink>
                        </li>
                        <li className='nav-item p-2'>
                            <NavLink to='/register'>Register</NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            <Switch>
                <Route exact path='/'>
                    <div>Home</div>
                </Route>
                <Route exact path='/login'>
                    <LoginContainer />
                </Route>
                <Route exact path='/register'>
                    <RegisterContainer />
                </Route>
            </Switch>
        </div>
    </Router>
  );
}

export default App;
