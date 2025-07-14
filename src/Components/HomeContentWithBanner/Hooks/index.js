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
  showExitApplicationModal,
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
import { useBackArrayContext } from "../../../Context/backArrayContext";
import { useMovieBannerContext } from "../../../Context/movieBannerContext";

const CATEGORY_MAP = {
  1: {
    cache: CACHE_KEYS.MOVIE_PAGE,
    screen: SCREEN_KEYS.HOME.MOVIES_HOME_PAGE,
    route: '/movies'
  },
  2: {
    cache: CACHE_KEYS.WEBSERIES_PAGE,
    screen: SCREEN_KEYS.HOME.WEBSERIES_HOME_PAGE,
    route: '/webseries'
  },
  5: {
    cache: CACHE_KEYS.HOME_PAGE,
    screen: SCREEN_KEYS.HOME.HOME_PAGE,
    route: '/home'
  }
};

export const useContentWithBanner = (onFocus, category = 5, focusKey) => {
  const { uid, isLoggedIn, userObjectId } = useUserContext();
  const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();
  const { setFocusedAssetDataContext,
    bannerDataContext,
    setBannerDataContext } = useMovieBannerContext();

  const history = useHistory();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const didFocusSelfOnce = useRef(false);
  const [isLoadingPagingRows, setIsLoadingPagingRows] = useState(false);
  const [categoryState, setCategoryState] = useState(category);
  const[hasMoreRows,setHasMoreRows] = useState();

  const horizontalLimit = 10;
  const settleTimerRef = useRef(null);
  const isBannerLoadedRef = useRef(false);
  const SETTLE_DELAY = 200;

  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
    focusSelf
  } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: false,
    onFocus,
    preferredChildFocusKey: 'BANNER_FOCUS_KEY'
  });

  const categoryMeta = CATEGORY_MAP[category] || {};



  useEffect(() => {
    setBackArray(categoryMeta.screen, true);
  }, [category])

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];
      console.log(SCREEN_KEYS);
      if (backId === SCREEN_KEYS.HOME.HOME_PAGE) {
        showExitApplicationModal();
        setBackHandlerClicked(false);
        // popBackArray();
      } else if (backId === SCREEN_KEYS.HOME.MOVIES_HOME_PAGE || backId === SCREEN_KEYS.HOME.WEBSERIES_HOME_PAGE) {
        history.replace('/home');
        setBackHandlerClicked(false);
        popBackArray();
      }
    }
  }, [backHandlerClicked])



  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      let playlists = [];

      setCache(CACHE_KEYS.CURRENT_SCREEN, categoryMeta.screen);

      const { cache } = categoryMeta;
      const hasCachedData = cache &&
        hasCache(cache.HOME_DATA) &&
        hasCache(cache.BANNERS_DATA);

      if (hasCachedData) {
        playlists = getCache(cache.HOME_DATA);
        setBannerDataContext(getCache(cache.BANNERS_DATA));
      } else {
        const [bannerData, playlistRaw] = await Promise.all([
          fetchBannersBySection(category),
          fetchPlaylistPage(category, 1, uid, horizontalLimit)
        ]);
        const processed = getProcessedPlaylists(playlistRaw, horizontalLimit);
        playlists = processed;
        setHasMoreRows(processed.length === horizontalLimit);
        // setBanners([]);
        setBannerDataContext(bannerData?.data || []);

        if (cache) {
          setCache(cache.HOME_DATA, processed);
          setCache(cache.BANNERS_DATA, bannerData?.data || []);
        }
      }

      playlists = playlists.filter(row => !row?.isContinueWatching);

      if (isLoggedIn && uid && category === 5) {
        const continueData = await fetchContinueWatchingData(uid);
        playlists = getProcessedPlaylistsWithContinueWatch(playlists, continueData);
      }

      setData(playlists);
      setPage(1);
    } catch (error) {
      console.error("Failed to load home data", error);
    } finally {
      setIsLoading(false);
    }
  }, [category, uid, isLoggedIn, categoryMeta]);

const loadMoreRows = useCallback(async () => {
  if (isLoading || isLoadingPagingRows || !hasMoreRows) return;
  setIsLoadingPagingRows(true);
  try {
    const nextPage = page + 1;
    const raw = await fetchPlaylistPage(category, nextPage, uid, horizontalLimit);
    if (!raw || raw.length === 0) {
      setHasMoreRows(false);
      return;
    }
    const processed = getProcessedPlaylists(raw, horizontalLimit);
    setData(prev => [...prev, ...processed]);
    setPage(nextPage);
    setHasMoreRows(processed.length === horizontalLimit);
  } catch (e) {
    console.error("Pagination error", e);
  } finally {
    setIsLoadingPagingRows(false);
  }
}, [category, uid, page, isLoading, isLoadingPagingRows]);



  const handleAssetFocus = useCallback((asset) => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      setFocusedAssetDataContext(asset);
      settleTimerRef.current = null;
    }, SETTLE_DELAY);
  }, []);

  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

  const onAssetPress = useCallback((item) => {
    if (isLoggedIn && userObjectId) {
      if (item?.assetData?.isSeeMore) {
        history.push('/seeAll', {
          playListId: item.assetData.playListId,
          playListName: ''
        });
      } else {
        history.push(`/detail/${item.assetData.categoryID}/${item.assetData.mediaID}`);
      }
    } else {
      showModal('Login', 'You are not logged in !!', [
        { label: 'Login', action: redirectToLogin, className: 'primary' }
      ]);
    }
  }, [isLoggedIn, userObjectId, history]);

  useEffect(() => {
    console.log('home page re_render');
  })

  useEffect(() => {
    loadInitialData();
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [loadInitialData]);

  useEffect(() => {
    if (
      !didFocusSelfOnce.current &&
      page === 1 &&
      (bannerDataContext.length > 0 || data.length > 0)
    ) {
      didFocusSelfOnce.current = true;
      console.log('<<< home content focused');
      focusSelf();
    }
  }, [data, focusSelf]);

  useEffect(() => {
    didFocusSelfOnce.current = false;
  }, [category]);

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    // focusedAssetData,
    handleAssetFocus,
    loadMoreRows,
    data,
    setData,
    isLoading,
    setIsLoading,
    // banners,
    // setFocusedAssetData,
    isBannerLoadedRef,
    categoryState,
    onAssetPress,
    hasMoreRows
  };
};
