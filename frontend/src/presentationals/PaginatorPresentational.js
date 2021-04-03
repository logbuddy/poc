import React, {Fragment} from 'react';

const PaginatorPresentational = ({numberOfItems, itemsPerPage, currentPage, onPageClicked}) => {
    console.debug('PaginatorPresentational currentPage', currentPage);
    const numberOfPages = Math.ceil(numberOfItems / itemsPerPage);

    if (numberOfPages < 2) {
        return <Fragment/>;
    }

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
        <div className='bg-dark rounded p-2'>
            {pageElements}
        </div>
    );
};

export default PaginatorPresentational;
