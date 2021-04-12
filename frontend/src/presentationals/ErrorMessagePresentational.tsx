import React, { Fragment } from 'react';

const ErrorMessagePresentational = ({ message }: { message: null | string }) => (
    ((message !== null) && <div className='alert alert-danger'>{ message }</div>) || <Fragment />
);

export default ErrorMessagePresentational;
