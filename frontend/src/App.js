import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import RegisterContainer from './containers/RegisterContainer';

function App() {
  return (
    <Router>
        <div>
            <nav className='navbar navbar-expand-sm navbar-light bg-light'>
                <div className="container-fluid">
                    <ul className='navbar-nav'>
                        <li className='nav-item p-2'>
                            <Link to='/'>Home</Link>
                        </li>
                        <li className='nav-item p-2'>
                            <Link to='/login'>Log in</Link>
                        </li>
                        <li className='nav-item p-2'>
                            <Link to='/register'>Register</Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <Switch>
                <Route path='/'>
                    <div>Home</div>
                </Route>
                <Route path='/login'>
                    <div>Login</div>
                </Route>
                <Route path='/register'>
                    <RegisterContainer />
                </Route>
            </Switch>
        </div>
    </Router>
  );
}

export default App;
