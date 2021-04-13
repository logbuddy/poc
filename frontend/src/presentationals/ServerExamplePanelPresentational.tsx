import React from 'react';
import { ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { Server } from '../redux/reducers/activeServer';

const ServerExamplePanelPresentational = ({ server, isOpen, onSwitch }:
                                              { server: Server, isOpen: boolean, onSwitch: () => any }) => (
    <div className='card-body bg-dark pt-0 pb-0'>
        <div
            className='clickable'
            onClick={ () => onSwitch() }
        >
            <span className='small align-text-bottom'>
                {
                    isOpen
                    &&
                    <ChevronDown />
                }
                {
                    isOpen
                    ||
                    <ChevronRight />
                }
            </span>
            &nbsp;
            Sample curl command
        </div>
        {
            isOpen
            &&
            <div className='mb-2 mt-2 bg-deepdark pt-2 ps-2 pe-3 rounded border border-dark border-3'>
                <code><pre>{`curl \\
  -X POST \\
  "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \\
  -d '{ "userId": "${server.userId}",
        "apiKeyId": "${server.apiKeyId}",
        "serverId": "${server.id}",
        "events": [{
                     "createdAt": "'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'",
                     "source": "uptime on '"$(hostname)"'",
                     "payload": "'"$(uptime)"'"
                   }]}'`}</pre></code>
            </div>
        }
        <hr/>
    </div>
);

export default ServerExamplePanelPresentational;
