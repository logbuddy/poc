import React, { Fragment } from 'react';

const PaginatorPresentational = ({numberOfItems, itemsPerPage, currentPage, onPageClicked}) => {
    const numberOfPages = Math.ceil(numberOfItems / itemsPerPage);

    const pageElements = [];
    for (let i = 0; i < numberOfPages; i++) {
        pageElements.push(
            <span
                key={i}
                className={`
                    me-1
                    badge
                    ${ i+1 === currentPage && 'bg-primary'}
                    ${ i+1 === currentPage || 'bg-secondary clickable'}                    
                `}
                onClick={ () => {
                    if (i+1 !== currentPage) {
                        onPageClicked(i+1)
                    }
                }}
            >
                {i+1}
            </span>
        );
    }

    return (
        <Fragment>
            <span className='pe-2'>
                Result pages:
            </span>
            {pageElements}
        </Fragment>
    );
};

export default PaginatorPresentational;
