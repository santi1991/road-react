// import './App.css';
import styles from './App.module.css';
import React from 'react';
import axios from 'axios';
import { ReactComponent as Check } from './check.svg';
// import styled from 'styled-components';



const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {

  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A');
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const getSumComments = (stories) => {
  console.log(`${Date.now()} C`);
  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const sumComments = React.useMemo(() =>
    getSumComments(stories)
    , [stories,]);

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = React.useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleSearchSubmit = React.useCallback((event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  }, []);

  const handleFetchStories = React.useCallback(async () => {

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch (error) {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }

  }, [url]);


  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  console.log('B:App');

  return (
    <div className={styles.container}>
      {/* <h1 className={styles.headlinePrimary}>My Hacker Stories</h1> */}
      <h1>My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {
        stories.isError &&
        <p>Something went wrong ...</p>
      }
      {
        stories.isLoading ? (
          <p>Loading ...</p>
        ) : (
          <List
            list={stories.data}
            onRemoveItem={handleRemoveStory}
          />
        )
      }
    </div>
  );
}

export default App;

//Reusable React Components  and  React Component Composition
const SearchForm = React.memo(
  ({ searchTerm, onSearchInput, onSearchSubmit }) => console.log(`${Date.now()} B: SearchForm`) || (
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

const List = React.memo(
  ({ list, onRemoveItem }) => console.log('B:List') || (
    <ul>
      {list.map((item) => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </ul>
  )
);

const Item = React.memo(
  ({ item, onRemoveItem }) => {

    const handleRemoveItem = () => {
      onRemoveItem(item);
    };
    console.log(`${Date.now()} B: Item`)
    return (
      <li className={styles.item}>
        <span style={{ width: '40%' }}>
          <a href={item.url}>{item.title} </a>
        </span>
        <span style={{ width: '30%' }}>{item.author} </span>
        <span style={{ width: '10%' }}>{item.num_comments} </span>
        <span style={{ width: '10%' }}>{item.points} </span>
        <span style={{ width: '10%' }}>
          <button
            type="button"
            onClick={handleRemoveItem}
            className={`${styles.button} ${styles.buttonSmall}`}
          >
            <Check height="18px" width="18px" className={styles.button} />
          </button>
        </span>
      </li>
    )
  });



