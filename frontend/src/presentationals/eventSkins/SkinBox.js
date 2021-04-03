import React from 'react';

const SkinBox = ({type, logo, children}) => (
    <div className={`mt-0 mb-2 alert alert-${type}`}>
        <div className='ms-2 float-end'>{logo}</div>
        {children}
    </div>
);

export default SkinBox;
