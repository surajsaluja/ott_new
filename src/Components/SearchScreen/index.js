import React, { useEffect, useState, useCallback } from 'react';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom';
import { SearchKeyboard } from './Keyboard';
import FullPageAssetContainer from '../Common/FullPageAssetContainer';
import { fetchSearchContentResult, fetchTrendingSearch } from '../../Service/MediaService';
import { showModal, getCategoryIdByCategoryName } from '../../Utils';
import { useUserContext } from '../../Context/userContext';
import { getCache, setCache, CACHE_KEYS, SCREEN_KEYS } from '../../Utils/DataCache';
import './index.css';
import { useBackArrayContext } from '../../Context/backArrayContext';

const SEARCH_PAGE_SIZE = 10;

function SearchScreen({ focusKey }) {
  const [searchData, setSearchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
     const {setBackArray, backHandlerClicked,currentArrayStack, setBackHandlerClicked, popBackArray} = useBackArrayContext();

  const history = useHistory();
  const { isLoggedIn, userObjectId } = useUserContext();

  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey,
    focusable: true,
  });

  const loadTrendingSearchResult = async () => {
    const cachedData = getCache(CACHE_KEYS.SEARCH.TRENDING_SEARCH);
    if (cachedData) {
      setSearchData(cachedData);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setSearchData([]);
    setPageNum(1);

    try {
      const response = await fetchTrendingSearch();
      if (response?.isSuccess) {
        setSearchData(response.data);
        setCache(CACHE_KEYS.SEARCH.TRENDING_SEARCH, response.data);
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
        setSearchData(prev => (page === 1 ? newData : [...prev, ...newData]));
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

  useEffect(() => {
    setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.HOME.SEARCH_HOME_PAGE);
    loadTrendingSearchResult();
  }, []);

  useEffect(() => {
    if (inputQuery.length > 0) {
      loadSearchData(1);
    } else {
      loadTrendingSearchResult();
    }
  }, [inputQuery]);

  const loadMoreRows = async () => {
    if (isLoading || !hasMore) return;
    const nextPage = pageNum + 1;
    await loadSearchData(nextPage);
  };

  function truncateStart(text, maxLength) {
  return text.length > maxLength
    ? '…' + text.slice(-maxLength)
    : text;
}

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

  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

useEffect(()=>{
    setBackArray(SCREEN_KEYS.HOME.SEARCH_HOME_PAGE, true);
  },[]);

useEffect(() => {
  if (backHandlerClicked && currentArrayStack.length > 0) {
    const backId = currentArrayStack[currentArrayStack.length - 1];

    if (backId === SCREEN_KEYS.HOME.SEARCH_HOME_PAGE) {
      history.replace('/home');
      popBackArray();
      setBackHandlerClicked(false);
    }
  }
}, [backHandlerClicked, currentArrayStack]);

  const onAssetPress = useCallback((assetData) => {
    if (isLoggedIn && userObjectId) {
      const categoryId = getCategoryIdByCategoryName(assetData?.category);
      let openWebSeries = assetData.openWebSeries === true ? 1 : 0;
      history.push(`/detail/${categoryId}/${assetData?.mediaID}/${assetData.webSeriesID ?? 0}/${openWebSeries}`);
    } else {
      showModal('Login', 'You are not logged in !!', [
        { label: 'Login', action: redirectToLogin, className: 'primary' },
      ]);
    }
  }, [isLoggedIn, userObjectId, history]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='search-page' ref={ref}>
        <div className='keyboard-container'>
          <div className='search-input'>
            <div className='search-input-text' style={{ color: inputQuery ? 'white' : '#797474' }}>
            {truncateStart(inputQuery,20) || 'SEARCH'}
            </div>
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
          onAssetPress={onAssetPress}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default SearchScreen;