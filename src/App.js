import styles from './App.module.css';
import React from 'react';
import axios from 'axios';

import List from './components/List';
import SearchForm from './components/SearchForm';
import LastSearches from './components/LastSearches';

// https://hn.algolia.com/api   -> API

// const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

// careful: notice the ? and & in between
const getUrl = (searchTerm, page) =>
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

// const getUrl = (searchTerm) => `${API_ENDPOINT}${searchTerm}`;

const useSemiPersistentState = (key, initialState) => {

  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const getSumComments = (stories) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
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
        data: action.payload.page === 0 ? action.payload.list : state.data.concat(action.payload.list),
        page: action.payload.page,
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

const extractSearchTerm = (url) =>
  url
    .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
    .replace(PARAM_SEARCH, '');

const getLastSearches = (urls) =>
  urls
    .reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);




const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // important: still wraps the returned value in []
  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const sumComments = React.useMemo(() => getSumComments(stories), [stories,]);

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = React.useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);



  const handleFetchStories = React.useCallback(async () => {

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        // payload: result.data.hits,
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    } catch (error) {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }

  }, [urls]);

  const handleSearchSubmit = (event) => {
    handleSearch(searchTerm, 0);
    event.preventDefault();
  };

  const handleLastSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const handleSearch = (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  };

  const lastSearches = getLastSearches(urls);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };


  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);


  return (
    <div className={styles.container}>

      

      <h4 style={{margin:0}}>This project was made as part of the book: <a href='https://www.roadtoreact.com/' rel='noreferrer' target='_blank'>The Road to React</a></h4>
      <h4>Do not forget to visit my profile: <a href='https://santi1991.github.io/me' rel='noreferrer' target='_blank'>About me =D !</a></h4>
      

      <h1 style={styles.headlinePrimary} >My Hacker Stories.</h1>
      

      <h5 style={{margin:0}}>This search has {sumComments} comments...</h5>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      
      {
        lastSearches.length > 0 && <h5 style={{margin:0, fontStyle:'italic'}} >search history:</h5>
      }
      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      <hr />

      {
        stories.isError &&
        <p>Something went wrong ...</p>
      }

      <List list={stories.data} onRemoveItem={handleRemoveStory} />
      {
        stories.isLoading ? (
          <p>Loading ...</p>
        ) : (
          <button
            type="button"
            onClick={handleMore}
            className={`${styles.button} ${styles.buttonLarge}`}
          >
            More...
          </button>
        )
      }

    </div>
  );
}


export default App;
export { storiesReducer };



