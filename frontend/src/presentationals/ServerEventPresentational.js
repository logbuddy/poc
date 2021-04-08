import React, { Fragment } from 'react';

const ServerEventPresentational = ({ serverEvent }) => (
    <Fragment>
        <div>
            { serverEvent.id }
            { JSON.stringify(serverEvent.createdAt) }
            { serverEvent.source }
            { serverEvent.payload }
        </div>
    </Fragment>
);

export default ServerEventPresentational;
