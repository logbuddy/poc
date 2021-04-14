import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { ReduxState } from '../redux/reducers/root';
import { createServerCommand, retrieveServersCommand } from '../redux/reducers/servers';
import { Redirect } from 'react-router-dom';
import ActiveServerPresentational from './ActiveServerPresentational';
import { makeServerActiveCommand } from '../redux/reducers/activeServer';
import { ArrowClockwise, Disc } from 'react-bootstrap-icons';
import ErrorMessagePresentational from './ErrorMessagePresentational';

const ServersPresentational = () => {

    const reduxState = useSelector((state: ReduxState) => state);
    const reduxDispatch = useDispatch();

    const [createServerTitle, setCreateServerTitle] = useState('');

    useEffect(() => {
        reduxDispatch(retrieveServersCommand());
    }, [reduxDispatch]);

    if (!reduxState.session.isLoggedIn) {
        return (<Redirect to='/login' />);
    }

    if (reduxState.activeServer.server.id !== null) {
        return <ActiveServerPresentational />;
    }

    const serverElements = [];
    for (let server of reduxState.servers.servers) {
        serverElements.push(
            <div key={server.id} className={`card bg-dark mt-4`}>
                <div className='card-header border-bottom border-dark'>
                    <div className='row'>
                        <div className='text-primary col server-headline-icon'>
                            {
                                server.type === 'dayz'
                                &&
                                <img src='assets/images/event-skins/dayz/dayz-logo.png' width='26' className='pt-1 pe-1' alt='DayZ Logo' />
                            }
                            {
                                server.type === 'default'
                                &&
                                <img src='assets/images/logbuddy-icon.png' width='26' className='pt-1 pe-1' alt='LogBuddy Icon' />
                            }
                        </div>
                        <div className='col server-headline-title'>
                            <h4
                                className='mb-0 clickable'
                                onClick={() => reduxDispatch(makeServerActiveCommand(server))}
                            >
                                {server.title}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='m-0'>
            <div className='m-3'>
                <div className='navbar navbar-expand me-3'>
                    <ul className='navbar-nav ms-auto'>
                        <li className='nav-item text-center'>
                            {
                                reduxState.servers.retrieveServersOperation.isRunning
                                &&
                                <Disc className={`text-light ${reduxState.servers.retrieveServersOperation.isRunning ? 'spinning' : 'spinning not-spinning'}`} />
                            }
                            {
                                reduxState.servers.retrieveServersOperation.isRunning
                                ||
                                <span className='clickable' onClick={ () => reduxDispatch(retrieveServersCommand()) }><ArrowClockwise className='spinning not-spinning' /></span>
                            }
                        </li>
                    </ul>
                </div>

                <ErrorMessagePresentational message={reduxState.servers.retrieveServersOperation.errorMessage} />

                <h1 className='mb-3 ms-3'>
                    My servers
                </h1>

                <div className='card card-body bg-dark pt-0'>
                    <form
                        className='row row-cols-sm-auto g-3 mt-2 mb-2'
                        onSubmit={ (e) => {
                            reduxDispatch(createServerCommand(createServerTitle));
                            e.preventDefault();
                            setCreateServerTitle('');
                        }}
                    >
                        <div className='col-12'>
                            <label className='visually-hidden' htmlFor='create-server-title'>Name of new server</label>
                            <div className='input-group'>
                                <div className='input-group-text'>Add server</div>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='create-server-title'
                                    placeholder='Name of new server'
                                    value={createServerTitle}
                                    onChange={ (e) => setCreateServerTitle(e.target.value) }
                                />
                            </div>
                        </div>

                        <div className='col-12'>
                            {
                                reduxState.servers.createServerOperation.isRunning
                                &&
                                <button className='float-end btn btn-warning disabled'>Adding...</button>
                            }
                            {
                                reduxState.servers.createServerOperation.isRunning
                                ||
                                (
                                    (createServerTitle.length > 0)
                                    &&
                                    <button type='submit' className='float-end btn btn-success fade-in'>Add</button>
                                )
                            }
                        </div>
                    </form>
                </div>

                {
                    serverElements.length > 0
                    &&
                    serverElements
                }

                {
                    serverElements.length > 0
                    ||
                    <div className='mt-5 w-100 text-center'>
                        <h1 className='text-secondary'>
                            Loading server data, please wait...
                        </h1>
                    </div>
                }
            </div>
        </div>
    );
};

export default ServersPresentational;
