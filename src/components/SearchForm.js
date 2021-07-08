import styles from '../App.module.css';
import React from 'react';
import InputWithLabel from './InputWithLabel';

const SearchForm = React.memo(
    ({ searchTerm, onSearchInput, onSearchSubmit }) => (
        <form onSubmit={onSearchSubmit} className={styles.searchForm}>
            <InputWithLabel
                id="search"
                value={searchTerm}
                isFocused
                onInputChange={onSearchInput}
            >
                <strong>Search:</strong>
            </InputWithLabel>
            <button
                type="submit"
                disabled={!searchTerm}
                className={`${styles.button} ${styles.buttonLarge}`}
            >
                Submit
            </button>
        </form>
    )
);

export default SearchForm;