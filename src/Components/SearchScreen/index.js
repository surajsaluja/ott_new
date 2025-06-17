import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useEffect, useState } from 'react';
import { SearchKeyboard } from './Keyboard';
import FullPageAssetContainer from '../Common/FullPageAssetContainer';
import './index.css';
import { fetchSearchContentResult, fetchTrendingSearch } from '../../Service/MediaService';

const SEARCH_PAGE_SIZE = 10;

function SearchScreen({ focusKey }) {
  const [searchData, setSearchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey,
    focusable: true
  });

  // Fetch trending search
  const loadTrendingSearchResult = async () => {
    setIsLoading(true);
    setSearchData([]);
    setPageNum(1);
    try {
      const response = await fetchTrendingSearch();
      if (response?.isSuccess) {
        setSearchData(response.data);
        setHasMore(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Trending error', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + Paginated search
  const loadSearchData = async (page = 1) => {
    if (inputQuery.length === 0) return;

    if (page === 1) {
      setSearchData([]);
      setIsLoading(true);
    }

    try {
      const response = await fetchSearchContentResult(inputQuery, page, SEARCH_PAGE_SIZE);
      if (response?.isSuccess) {
        const newData = response.data;
        setSearchData(prev => page === 1 ? newData : [...prev, ...newData]);
        setHasMore(newData.length === SEARCH_PAGE_SIZE);
        setPageNum(page);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Search error', error);
    } finally {
      if (page === 1) setIsLoading(false);
    }
  };

  // Load on first mount
  useEffect(() => {
    loadTrendingSearchResult();
  }, []);

  // Re-query when text changes
  useEffect(() => {
    if (inputQuery.length > 0) {
      loadSearchData(1);
    } else {
      loadTrendingSearchResult();
    }
  }, [inputQuery]);

  // Load more on scroll
  const loadMoreRows = async () => {
    if (isLoading || !hasMore) return;
    const nextPage = pageNum + 1;
    await loadSearchData(nextPage);
  };

  const onKeyPress = (key) => {
    switch (key) {
      case 'delete':
        setInputQuery(prev => prev.slice(0, -1));
        break;
      case 'space':
        setInputQuery(prev => prev + ' ');
        break;
      case 'clear':
        setInputQuery('');
        break;
      default:
        setInputQuery(prev => prev + key);
    }
  };

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='search-page' ref={ref}>
        <div className='keyboard-container'>
          <div className='search-input' style={{ color: inputQuery ? 'white' : '#797474' }}>
            {inputQuery || 'SEARCH'}
          </div>
          <SearchKeyboard onKeyPress={onKeyPress} focusKey={'KEYBOARD_FOCUS_KEY'} />
        </div>

        <FullPageAssetContainer
          focusKey='SEARCH_PAGE_ASSETS'
          assets={searchData}
          itemsPerRow={3}
          title={inputQuery ? 'Search Results' : 'Trending Searches'}
          isLoading={isLoading}
          isPagination={!!inputQuery}
          hasMore={hasMore}
          loadMoreRows={loadMoreRows}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default SearchScreen;