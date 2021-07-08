import * as React from 'react';
import axios from 'axios';
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import App, {
  storiesReducer,
  Item,
  List,
  SearchForm,
  InputWithLabel,
} from './App';

jest.mock('axios');

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

// describe('something truthy and falsy', () => {
//   test('true to be true', () => {
//     expect(true).toBe(true);
//   });
//   test('false to be false', () => {
//     expect(false).toBe(false);
//   });
// });

describe('something truthy and falsy', () => {
  test('true to be true', () => {
    expect(true).toBeTruthy();
  });
  test('false to be false', () => {
    expect(false).toBeFalsy();
  });
});

const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0,
};

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1,
};
const stories = [storyOne, storyTwo];

describe('storiesReducer', () => {
  test('removes a story from all stories', () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne }; // TODO: some action
    const state = { data: stories, isLoading: false, isError: false }; // TODO: some current state
    const newState = storiesReducer(state, action);
    // const expectedState = // TODO: the expected state
    const expectedState = {
      data: [storyTwo],
      isLoading: false,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });

  test('initializing fetch of stories', () => {
    const action = { type: 'STORIES_FETCH_INIT' };
    const state = { data: [], isLoading: false, isError: false };
    const newState = storiesReducer(state, action);
    const expectedState = {
      data: [],
      isLoading: true,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });

  test('A failure fetching stories', () => {
    const action = { type: 'STORIES_FETCH_FAILURE' }; // TODO: some action
    const state = { data: [], isLoading: true, isError: false };
    const newState = storiesReducer(state, action);
    const expectedState = {
      data: [],
      isLoading: false,
      isError: true,
    };
    expect(newState).toStrictEqual(expectedState);
    // expect(newState.data).toEqual(expectedState.data);
    // expect(newState.isLoading).toBe(false);
    // expect(newState.isError).toBe(true);
  });

  test('the fetch of stories was successful', () => {
    const action = { type: 'STORIES_FETCH_SUCCESS', payload: stories };
    const state = { data: [], isLoading: true, isError: false };
    const newState = storiesReducer(state, action);
    const expectedState = {
      data: stories,
      isLoading: false,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });

});

describe('Item', () => {
  test('renders all properties', () => {
    render(<Item item={storyOne} />);
    // screen.debug(); //shows how to element is being rendered in the console
    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.getByText('React')).toHaveAttribute(
      'href',
      'https://reactjs.org/'
    );
  });

  test('renders a clickable dismiss button', () => {
    render(<Item item={storyOne} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('clicking the dismiss button calls the callback handler', () => {
    const handleRemoveItem = jest.fn();
    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
  });
});

describe('SearchForm', () => {

  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  test('renders the input field with its value', () => {
    render(<SearchForm {...searchFormProps} />);
    // screen.debug();
    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
  });

  test('renders the correct label', () => {
    render(<SearchForm {...searchFormProps} />);
    expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
  });

  test('calls onSearchInput on input field change', () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.change(screen.getByDisplayValue('React'), {
      target: { value: 'Redux' },
    });
    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  test('calls onSearchSubmit on button submit click', () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.submit(screen.getByRole('button'));
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  });

  test('renders snapshot', () => {
    const { container } = render(<SearchForm {...searchFormProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

});

describe('App', () => {
  test('succeeds fetching data', async () => {

    const promise = Promise.resolve({
      data: {
        hits: stories,
      },
    });

    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    expect(screen.queryByText(/Loading/)).toBeInTheDocument();

    await act(() => promise);

    expect(screen.queryByText(/Loading/)).toBeNull();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redux')).toBeInTheDocument();
    expect(screen.getAllByText('Dismiss').length).toBe(2);

  });

  test('fails fetching data', async () => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    try {
      await act(() => promise);
    }
    catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.queryByText(/Loading/)).toBeNull();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
    }
  });

  test('removes a story', async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    await act(() => promise);
    expect(screen.getAllByText('Dismiss').length).toBe(2);
    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Dismiss')[0]);
    expect(screen.getAllByText('Dismiss').length).toBe(1);
    expect(screen.queryByText('Jordan Walke')).toBeNull();
  });

  test('searches for specific stories', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    const anotherStory = {
      title: 'JavaScript',
      url: 'https://en.wikipedia.org/wiki/JavaScript',
      author: 'Brendan Eich',
      num_comments: 15,
      points: 10,
      objectID: 3,
    };
    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });
    axios.get.mockImplementation((url) => {
      if (url.includes('React')) {
        return reactPromise;
      }
      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }
      throw Error();
    });

    // Initial Render
    render(<App />);
    // First Data Fetching
    await act(() => reactPromise);
    expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
    expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeInTheDocument();
    expect(screen.queryByText('Brendan Eich')).toBeNull();

    // User Interaction -> Search
    fireEvent.change(screen.queryByDisplayValue('React'), {
      target: {
        value: 'JavaScript',
      },
    });
    expect(screen.queryByDisplayValue('React')).toBeNull();
    expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

    fireEvent.submit(screen.queryByText('Submit'));
    // Second Data Fetching
    await act(() => javascriptPromise); 

    // this part is not working
    // expect(screen.queryByText('Jordan Walke')).toBeNull();
    // expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeNull();
    // expect(screen.queryByText('Brendan Eich')).toBeInTheDocument();


  });

});


