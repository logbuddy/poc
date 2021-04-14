import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ErrorMessagePresentational from './ErrorMessagePresentational';
import { ReduxState } from '../redux/reducers/root';
import { logIntoAccountCommand } from '../redux/reducers/session';

const LoginPresentational = () => {

    const reduxState = useSelector((state: ReduxState) => state);
    const reduxDispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className='container-fluid ps-4 mt-4'>
            <div className='row'>
                <div className='col-xs-auto col-sm-12 col-md-8 col-lg-6 col-xl-4'>
                    {
                        reduxState.session.registrationOperation.justFinishedSuccessfully
                        &&
                        <div className='alert alert-success'>Registration finished successfully. Please log in.</div>
                    }
                    <h1>Login</h1>
                    <ErrorMessagePresentational message={reduxState.session.loginOperation.errorMessage} />
                    <form onSubmit={ e => { reduxDispatch(logIntoAccountCommand(email, password)); e.preventDefault(); } } className='mt-4'>
                        <div className="mb-4">
                            <input className='form-control' type='text' id='email' placeholder='E-Mail' value={email} onChange={ e => setEmail(e.target.value) } />
                        </div>
                        <div className="mb-4">
                            <input className='form-control' type='password' id='password' placeholder='Password' value={password} onChange={ e => setPassword(e.target.value) } />
                        </div>
                        <div className="mt-4">
                            {
                                reduxState.session.loginOperation.isRunning
                                &&
                                <button className='btn btn-warning disabled'>Processing login...</button>
                            }
                            {
                                reduxState.session.loginOperation.isRunning
                                ||
                                <button className='btn btn-primary' type='submit'>Log in</button>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPresentational;
