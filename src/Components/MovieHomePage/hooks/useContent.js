import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { getProcessedPlaylists, useThrottle, getProcessedPlaylistsWithContinueWatch, showModal } from "../../../Utils";
import { useUserContext } from "../../../Context/userContext";
import { smoothScroll } from "../../../Utils";
import { fetchContinueWatchingData, fetchPlaylistPage, fetchBannersBySection } from "../../../Service/MediaService";
import { useHistory } from "react-router-dom";

/* ------------------ Content Row Hook ------------------ */
const useContentRow = (focusKey, onFocus, handleAssetFocus) => {
  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
  } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: true,
    onFocus,
  });

  const scrollingRowRef = useRef(null);

  // const onScrollToElement = 
  //   debounce((element) => {
  //     if (element && scrollingRowRef.current) {
  //       const parentRect = scrollingRowRef.current.getBoundingClientRect();
  //       const elementRect = element.getBoundingClientRect();

  //       const scrollLeft =
  //         scrollingRowRef.current.scrollLeft +
  //         (elementRect.left - parentRect.left - parentRect.x);

  //       smoothScroll(scrollingRowRef.current, scrollLeft);
  //     }
  //   }, 200);

  // const onScrollToElement = useThrottle((element) => {
  //   if (element && scrollingRowRef.current) {
  //     const parentRect = scrollingRowRef.current.getBoundingClientRect();
  //     const elementRect = element.getBoundingClientRect();

  //     const scrollLeft =
  //       scrollingRowRef.current.scrollLeft +
  //       (elementRect.left - parentRect.left - 80);

  //     smoothScroll(scrollingRowRef.current, scrollLeft);
  //   }
  // }, 300); // Adjust throttle interval to your liking

  const rafRef = useRef(null);

  const onScrollToElement = (element) => {
    if (!element || !scrollingRowRef.current) return;

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const parentRect = scrollingRowRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollLeft =
        scrollingRowRef.current.scrollLeft +
        (elementRect.left - parentRect.left - parentRect.x);

      smoothScroll(scrollingRowRef.current, scrollLeft, 150);
    });
  };



  const onAssetFocus = useCallback((element, data) => {
    onScrollToElement(element);
    handleAssetFocus(data);
  }, [onScrollToElement, smoothScroll]);


  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  };
};

/* ------------------ Movie Home Page Hook ------------------ */
const useMovieHomePage = (focusKeyParam, data, setData, isLoading, setIsLoading, loadMoreRows,handleAssetFocus) => {
  const history = useHistory();
  const { userObjectId, isLoggedIn } = useUserContext();

  const { ref, focusKey, hasFocusedChild } = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  useEffect(()=>{
    if(!hasFocusedChild){
      handleAssetFocus(null);
    }
  },[hasFocusedChild]);

  const loadMoreRef = useRef(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreRows();
        }
      },
      {
        rootMargin: "600px",
        threshold: 0.5,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [data]);

  const onRowFocus = useCallback((element) => {
    if (element && ref.current) {
      const scrollTop = element.top - ref.current.offsetTop;
      ref.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [ref, smoothScroll]);

  const redirectToLogin = () => {
    history.replace('/login', { from: '/' });
  };

  const onAssetPress = (item) => {
    if (isLoggedIn && userObjectId) {
      history.push(`/detail/${item?.assetData?.categoryID}/${item?.assetData?.mediaID}`);
        }
        else {
          showModal('Login',
            'You are not logged in !!',
            [
              { label: 'Login', action: redirectToLogin, className: 'primary' }
            ]
          );
        }
  };

  return {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data,
    loadMoreRef,
    isLoading,
  };
};

/* ------------------ Content with Banner Hook ------------------ */
export const useContentWithBanner = (onFocus,category = 5, focusKey) => {
  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
  } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: false,
    onFocus,
  });

  const [focusedAssetData, setFocusedAssetData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPagingRows,setIsLoadingPagingRows] = useState(false);
  const [banners, setBanners] = useState([]);
  const horizontalLimit = 10;
  const [page, setPage] = useState(1);
  const { uid, isLoggedIn } = useUserContext();

  const settleTimerRef = useRef(null);
  const SETTLE_DELAY = 200;

  useEffect(() => {
    loadInitialData();
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [category]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const bannerData = await fetchBannersBySection(category);
      if (bannerData) {
        setBanners(bannerData?.data);
      }

      const playlistData = await fetchPlaylistPage(category, 1, uid);
      let processed = getProcessedPlaylists(playlistData, horizontalLimit);

      if (isLoggedIn && uid && category == 5) {
        const continueWatchlistData = await fetchContinueWatchingData(isLoggedIn ? uid : 0);
        processed = getProcessedPlaylistsWithContinueWatch(processed, continueWatchlistData);
      }

      setPage(1); // initially setting page to 1
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
      setData((prev) => [...prev, ...processed]);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error("Pagination error", e);
    } finally {
      setIsLoadingPagingRows(false);
    }
  }, 1000);

  const handleAssetFocus = useCallback((asset) => {
    // Cancel any pending update
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    // Fire a new timer
    settleTimerRef.current = setTimeout(() => {
      setFocusedAssetData(asset);      // <-- update happens only after the delay
      settleTimerRef.current = null;   // clean up
    }, SETTLE_DELAY);
  }, []);

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
  };
};

export { useContentRow, useMovieHomePage };
