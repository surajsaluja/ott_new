import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchUserWishlistItems } from '../../../../Service/MediaService';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom';
import { getCategoryIdByCategoryName } from '../../../../Utils';
import { useUserContext } from '../../../../Context/userContext';

const WISHLIST_PAGE_SIZE = 10;

const useWishList = (focusKey) => {
    const history = useHistory();
    const { uid, isLoggedIn } = useUserContext();

    const [wishlistData, setWishlistData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const hasMoreRef  = useRef(null);
    const [isError,setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const loadFavouriteData = async (page = 1) => {
        if (page === 1) setWishlistData([]);
        setIsLoading(true);

        try {
            if(isLoggedIn){
            const response = await fetchUserWishlistItems(page, WISHLIST_PAGE_SIZE);
            if (response && response?.isSuccess) {
                const newData = response.data;
                setWishlistData(prev => (page === 1 ? newData : [...prev, ...newData]));
                // setHasMore(newData.length === WISHLIST_PAGE_SIZE);
                hasMoreRef.current = newData.length === WISHLIST_PAGE_SIZE;
                setPageNum(page);
            } else {
                throw new Error(response?.message);
            }
        }else{
            throw new Error('Please login to view the wishlist items !!')
        }
        } catch (error) {
            console.error('Wishlist Data Error', error);
            setIsError(true);
            setErrorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
            loadFavouriteData(1);
    },[]);

   const loadMoreRows = useCallback(async () => {
    if (isLoading || !hasMoreRef.current) return;
    await loadFavouriteData(pageNum + 1);
}, [isLoading, hasMoreRef.current, pageNum, wishlistData]);


    const onCardPress = useCallback((assetData) => {
        history.push(`/detail/${getCategoryIdByCategoryName(assetData?.category)}/${assetData?.mediaID}`);
    }, [history]);

    const reloadWishList = () => {
        if (isLoggedIn) {
            loadFavouriteData(1);
        }
    };

      const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey, focusable : !isLoading && wishlistData.length > 0 });

      useEffect(() => {
        if (!isLoading && wishlistData.length > 0) {
            focusSelf();
        }
    }, [focusSelf, isLoading]);

    return {
        ref,
        wishlistData,
        isLoading,
        hasMore : hasMoreRef.current,
        currentFocusKey,
        loadMoreRows,
        onCardPress,
        isLoggedIn,
        reloadWishList,
        isError,
        errorMessage,
    };
};

export default useWishList;
