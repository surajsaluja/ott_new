import { useRef, useEffect, useState, useCallback } from "react";
import { useUserContext } from "../../../Context/userContext";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import {
  fetchBannersBySection,
  fetchPlaylistPage,
  fetchContinueWatchingData
} from "../../../Service/MediaService";
import {
  getProcessedPlaylists,
  getProcessedPlaylistsWithContinueWatch,
  showModal
} from "../../../Utils";
import { useThrottle } from "../../../Utils";
import { useHistory } from "react-router-dom";
import {
  getCache,
  setCache,
  hasCache,
  CACHE_KEYS,
  SCREEN_KEYS
} from "../../../Utils/DataCache";

export const useContentWithBanner = (onFocus, category = 5, focusKey) => {
  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild
  } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: false,
    onFocus
  });

  const [focusedAssetData, setFocusedAssetData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPagingRows, setIsLoadingPagingRows] = useState(false);
  const [banners, setBanners] = useState([]);
  const horizontalLimit = 10;
  const [page, setPage] = useState(1);

  const { uid, isLoggedIn, userObjectId } = useUserContext();
  const history = useHistory();
  const settleTimerRef = useRef(null);
  const SETTLE_DELAY = 200;

  useEffect(() => {
    loadInitialData();
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [category]);

  const getCategoryKeys = () => {
    switch (category) {
      case 1: return CACHE_KEYS.MOVIE_PAGE;
      case 2: return CACHE_KEYS.WEBSERIES_PAGE;
      case 5: return CACHE_KEYS.HOME_PAGE;
      default: return null;
    }
  };

  const getCurrentScreenKey = () => {
    switch (category) {
      case 1: return SCREEN_KEYS.HOME.MOVIES_HOME_PAGE;
      case 2: return SCREEN_KEYS.HOME.WEBSERIES_HOME_PAGE;
      case 5: return SCREEN_KEYS.HOME.HOME_PAGE;
      default: return null;
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      let processed = [];
      const cacheKeyGroup = getCategoryKeys();
      setCache(CACHE_KEYS.CURRENT_SCREEN,getCurrentScreenKey());

      if (cacheKeyGroup && hasCache(cacheKeyGroup.HOME_DATA) && hasCache(cacheKeyGroup.BANNERS_DATA)) {
        processed = getCache(cacheKeyGroup.HOME_DATA);
        setBanners(getCache(cacheKeyGroup.BANNERS_DATA));
      } else {
        const bannerData = await fetchBannersBySection(category);
        const playlistData = await fetchPlaylistPage(category, 1, uid);
        const processedPlaylists = getProcessedPlaylists(playlistData, horizontalLimit);

        if (cacheKeyGroup) {
          setCache(cacheKeyGroup.HOME_DATA, processedPlaylists);
          setCache(cacheKeyGroup.BANNERS_DATA, bannerData?.data || []);
        }

        setBanners(bannerData?.data || []);
        processed = processedPlaylists;
      }

      //Remove stale continue-watching row if any
      processed = processed.filter(row => !row?.isContinueWatching);

      // Always fetch fresh continueWatching data if category === 5 (home page)
      if (isLoggedIn && uid && category === 5) {
        const continueWatchlistData = await fetchContinueWatchingData(uid);
        processed = getProcessedPlaylistsWithContinueWatch(processed, continueWatchlistData);
      }

      setPage(1);
      setData(processed);
    } catch (e) {
      console.error("Failed to load homepage", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRows = useThrottle(async () => {
    if (isLoading || isLoadingPagingRows) return;
    setIsLoadingPagingRows(true);
    try {
      const raw = await fetchPlaylistPage(category, page + 1, uid);
      const processed = getProcessedPlaylists(raw, horizontalLimit);
      setData(prev => [...prev, ...processed]);
      setPage(prev => prev + 1);
    } catch (e) {
      console.error("Pagination error", e);
    } finally {
      setIsLoadingPagingRows(false);
    }
  }, 1000);

  const handleAssetFocus = useCallback((asset) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(() => {
      setFocusedAssetData(asset);
      settleTimerRef.current = null;
    }, SETTLE_DELAY);
  }, []);

  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

  const onAssetPress = (item) => {
    if (isLoggedIn && userObjectId) {
      if (item?.assetData?.isSeeMore === true) {
        history.push('/seeAll', {
          playListId: item?.assetData?.playListId,
          playListName: ''
        });
      } else {
        history.push(`/detail/${item?.assetData?.categoryID}/${item?.assetData?.mediaID}`);
      }
    } else {
      showModal('Login', 'You are not logged in !!', [
        { label: 'Login', action: redirectToLogin, className: 'primary' }
      ]);
    }
  };

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    focusedAssetData,
    handleAssetFocus,
    loadMoreRows,
    data,
    setData,
    isLoading,
    setIsLoading,
    banners,
    setFocusedAssetData,
    onAssetPress
  };
};
