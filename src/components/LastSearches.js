import React from 'react';
import styles from '../App.module.css';

const LastSearches = ({ lastSearches, onLastSearch }) => (
    <>
        
        {
            //  it complains or breaks if the same search term is used more than once Make the key more
            // specific by concatenating it with the index of the mapped array
            lastSearches.map((searchTerm, index) => (
                <button
                    key={searchTerm + index}
                    type="button"
                    onClick={() => onLastSearch(searchTerm)}
                    className={`${styles.button} ${styles.buttonSmall}`}
                    style={{margin:2}}
                >
                    {searchTerm}
                </button>
            ))
        }
    </>
);

export default LastSearches;