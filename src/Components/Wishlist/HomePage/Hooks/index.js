import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchUserWishlistItems } from '../../../../Service/MediaService';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom';
import { getCategoryIdByCategoryName } from '../../../../Utils';
import { useUserContext } from '../../../../Context/userContext';
import {
  getCache,
  setCache,
  hasCache,
  CACHE_KEYS,
  SCREEN_KEYS
} from '../../../../Utils/DataCache';

const WISHLIST_PAGE_SIZE = 10;

const useWishList = (focusKey) => {
  const history = useHistory();
  const { uid, isLoggedIn } = useUserContext();

  const [wishlistData, setWishlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const hasMoreRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const FAV_KEY = `${CACHE_KEYS.FAVOURITES.FAVOURITE_DATA}_${uid}`;

  const loadFavouriteData = async (page = 1) => {
    if (page === 1 && hasCache(FAV_KEY)) {
      const cached = getCache(FAV_KEY);
      setWishlistData(cached);
      hasMoreRef.current = cached.length === WISHLIST_PAGE_SIZE;
      setPageNum(1);
      return;
    }

    if (page === 1) setWishlistData([]);
    setIsLoading(true);

    try {
      if (!isLoggedIn) throw new Error('Please login to view the wishlist items !!');

      const response = await fetchUserWishlistItems(page, WISHLIST_PAGE_SIZE);
      if (response?.isSuccess) {
        const newData = response.data;
        const mergedData = page === 1 ? newData : [...wishlistData, ...newData];
        setWishlistData(mergedData);
        hasMoreRef.current = newData.length === WISHLIST_PAGE_SIZE;
        setPageNum(page);

        if (page === 1) {
          setCache(FAV_KEY, newData);
        }
      } else {
        throw new Error(response?.message);
      }
    } catch (error) {
      console.error('Wishlist Data Error', error);
      setIsError(true);
      setErrorMessage(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.HOME.FAVORITES_HOME_PAGE);
    loadFavouriteData(1);
  }, []);

  const loadMoreRows = useCallback(async () => {
    if (isLoading || !hasMoreRef.current) return;
    await loadFavouriteData(pageNum + 1);
  }, [isLoading, pageNum, wishlistData]);

  const onCardPress = useCallback(
    (assetData) => {
      history.push(`/detail/${getCategoryIdByCategoryName(assetData?.category)}/${assetData?.mediaID}`);
    },
    [history]
  );

  const reloadWishList = () => {
    if (isLoggedIn) {
      setCache(FAV_KEY, null); // Clear old cache
      loadFavouriteData(1);
    }
  };

  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
    focusKey,
    focusable: !isLoading && wishlistData.length > 0
  });

  useEffect(() => {
    if (!isLoading && wishlistData.length > 0) {
      focusSelf();
    }
  }, [focusSelf, isLoading]);

  return {
    ref,
    wishlistData,
    isLoading,
    hasMore: hasMoreRef.current,
    currentFocusKey,
    loadMoreRows,
    onCardPress,
    isLoggedIn,
    reloadWishList,
    isError,
    errorMessage
  };
};

export default useWishList;
