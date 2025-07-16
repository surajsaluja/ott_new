import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchUserWishlistItems } from '../../../../Service/MediaService';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom';
import { getCategoryIdByCategoryName } from '../../../../Utils';
import { useUserContext } from '../../../../Context/userContext';
import { CACHE_KEYS, setCache, SCREEN_KEYS } from '../../../../Utils/DataCache';
import { useBackArrayContext } from '../../../../Context/backArrayContext';

const WISHLIST_PAGE_SIZE = 10;

const useWishList = (focusKey) => {
  const history = useHistory();
   const {setBackArray, backHandlerClicked,currentArrayStack, setBackHandlerClicked, popBackArray} = useBackArrayContext();

  const { uid, isLoggedIn } = useUserContext();

  const [wishlistData, setWishlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const hasMoreRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadFavouriteData = async (page = 1) => {
    if (page === 1) {
      setWishlistData([]);
      setIsError(false);
      setErrorMessage(null);
    }

    setIsLoading(true);

    try {
      if (!isLoggedIn) {
        throw new Error('Please login to view the wishlist items !!');
      }

      const response = await fetchUserWishlistItems(page, WISHLIST_PAGE_SIZE);

      if (response?.isSuccess) {
        const newData = response.data;
        const mergedData = page === 1 ? newData : [...wishlistData, ...newData];
        setWishlistData(mergedData);
        hasMoreRef.current = newData.length === WISHLIST_PAGE_SIZE;
        setPageNum(page);
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
    loadFavouriteData(1);
      setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.HOME.FAVORITES_HOME_PAGE);
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

  useEffect(()=>{
      setBackArray(SCREEN_KEYS.HOME.FAVORITES_HOME_PAGE, true);
    },[]);
  
  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];
  
      if (backId === SCREEN_KEYS.HOME.FAVORITES_HOME_PAGE) {
        history.replace('/home');
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

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