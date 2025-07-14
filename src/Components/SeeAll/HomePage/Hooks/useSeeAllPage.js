import { fetchPlayListContent } from '../../../../Service/MediaService';
import { getCategoryIdByCategoryName } from '../../../../Utils';
import { useUserContext } from '../../../../Context/userContext';
import { showModal } from '../../../../Utils';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory, useLocation } from 'react-router-dom';
import { CACHE_KEYS, SCREEN_KEYS, setCache } from '../../../../Utils/DataCache';
import { useBackArrayContext } from '../../../../Context/backArrayContext';

const PLAYLIST_PAGE_SIZE = 10;

const useSeeAllPage = (focusKey) => {

    const { isLoggedIn, userObjectId } = useUserContext();

    const [focusedAssetData, setFocusedAssetData] = useState(null);
    const [playListData, setPlayListData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageNum, setPageNum] = useState(1);
    const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);
    const hasMoreRef = useRef(true);
    const settleTimerRef = useRef(null); // used to update the banner data after settle delay time
    const SETTLE_DELAY = 200;

    const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();

    const history = useHistory();
    const location = useLocation();

    const {playListId, playListName} = location.state || {};

    const loadPlayListData = async (page = 1) => {
        if(!playListId) return;
        if (page === 1) setPlayListData([]);
        setIsLoading(true);
        try {
            const response = await fetchPlayListContent(playListId, page, PLAYLIST_PAGE_SIZE);
            if (response?.isSuccess) {
                const newData = response.data;
                setPlayListData(prev => (page === 1 ? newData : [...prev, ...newData]));
                if (page === 1) {
                    setHasInitialDataLoaded(true);
                }
                hasMoreRef.current = newData.length === PLAYLIST_PAGE_SIZE;
                setPageNum(page);
            } else {
                throw new Error(response?.message || 'Failed to load playlist.');
            }
        } catch (error) {
            console.error('Playlist Data Error', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.HOME.SEE_ALL_HOME_PAGE);
        loadPlayListData(1);
    }, []);

    const loadMoreRows = useCallback(async () => {
        if (isLoading || !hasMoreRef.current) return;
        await loadPlayListData(pageNum + 1);
    }, [isLoading, pageNum]);

    const redirectToLogin = () => {
        history.push('/login', { from: '/' });
    };

    const onCardPress = useCallback((assetData) => {
        if (isLoggedIn && userObjectId) {
            const categoryId = getCategoryIdByCategoryName(assetData?.category);
            history.push(`/detail/${categoryId}/${assetData?.mediaID}`);
        }
        else {
            showModal('Login',
                'You are not logged in !!',
                [
                    { label: 'Login', action: redirectToLogin, className: 'primary' }
                ]
            );
        }
    }, [history]);

    const handleAssetFocus = useCallback((asset) => {
        // Cancel any pending update
        if (settleTimerRef.current) {
            clearTimeout(settleTimerRef.current);
        }

        // Fire a new timer
        settleTimerRef.current = setTimeout(() => {
            setFocusedAssetData(asset);
            settleTimerRef.current = null;
        }, SETTLE_DELAY);
    }, []);

      useEffect(() => {
    setBackArray(SCREEN_KEYS.HOME.SEE_ALL_HOME_PAGE, true);
  }, []);

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0){
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.HOME.SEE_ALL_HOME_PAGE) {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);


    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
        focusKey,
        focusable: !isLoading && playListData.length > 0
    });

    useEffect(() => {
        if (!isLoading) {
            focusSelf();
        }
    }, [focusSelf, isLoading]);

    return {
        ref,
        currentFocusKey,
        focusedAssetData,
        playListData,
        isLoading,
        hasMore: hasMoreRef.current,
        playListName,
        loadMoreRows,
        onCardPress,
        handleAssetFocus
    }
}

export default useSeeAllPage;