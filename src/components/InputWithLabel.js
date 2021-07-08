import styles from '../App.module.css';
import React from 'react';

const InputWithLabel = ({ id, value, onInputChange, isFocused, type = 'text', children }) => {

    const inputRef = React.useRef();

    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <>
            <label
                htmlFor={id}
                className={styles.label}
            >
                {children}
            </label>
            &nbsp;
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                onChange={onInputChange}
                className={styles.input}
            />
        </>
    )
};

export default InputWithLabel;