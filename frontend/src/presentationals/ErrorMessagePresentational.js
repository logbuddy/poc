import React from 'react';

const ErrorMessagePresentational = ({message}) => (
    (message !== null) && <div className='alert alert-danger'>{ message }</div>
);

export default ErrorMessagePresentational;
