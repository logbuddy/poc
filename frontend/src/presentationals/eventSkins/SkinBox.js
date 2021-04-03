import React from 'react';

const SkinBox = ({type, children}) => (
    <div className={`mt-2 mb-2 alert alert-${type}`}>
        {children}
    </div>
);

export default SkinBox;
