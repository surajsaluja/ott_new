import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";
import { getProcessedPlaylists, useThrottle, getProcessedPlaylistsWithContinueWatch } from "../../../Utils";
import { fetchContinueWatchingData, fetchHomePageData, fetchPlaylistPage } from "../../../Service/MediaService";
import { useUserContext } from "../../../Context/userContext";
import { debounce } from 'lodash';

/* ------------------ Utility: Smooth Scroll Animation ------------------ */
const smoothScroll = (element, target, duration = 300, direction = "horizontal") => {
  const start = direction === "horizontal" ? element.scrollLeft : element.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const easeInOutQuad = (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animateScroll = (currentTime) => {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const newVal = start + change * easeInOutQuad(progress);

    if (direction === "horizontal") {
      element.scrollLeft = newVal;
    } else {
      element.scrollTop = newVal;
    }

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};


/* ------------------ Asset Hook ------------------ */
const useAsset = (image) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { imgRef, shouldLoad, imageUrl } = useIntersectionImageLoader(image);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
};

/* ------------------ Content Row Hook ------------------ */
const useContentRow = (focusKey, onFocus) => {
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
  const focusTimeout = useRef(null);

const onAssetFocus = useCallback(
  debounce((element) => {
    if (element && scrollingRowRef.current) {
      const parentRect = scrollingRowRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollLeft =
        scrollingRowRef.current.scrollLeft +
        (elementRect.left - parentRect.left) - 80;

      smoothScroll(scrollingRowRef.current, scrollLeft);
    }
  }, 50),
  []
);


  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  };
};

/* ------------------ Movie Home Page Hook ------------------ */
const useMovieHomePage = (focusKeyParam, history, data, setData, isLoading, setIsLoading, loadMoreRows) => {
  const { ref, focusKey } = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

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
  }, [ref]);

  const onAssetPress = (item) => {
    console.log("Selected asset:", item.data);
    // history.push("/detail", item.data);
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
export const useContentWithBanner = (focusKey, onFocus) => {
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
  const [banners, setBanners] = useState([]);
  const horizontalLimit = 10;
  const [page, setPage] = useState(1);
  const { profileInfo, uid, isLoggedIn } = useUserContext();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const raw = await fetchHomePageData(isLoggedIn ? uid : 0);
      let processed = getProcessedPlaylists(raw.playlists, horizontalLimit);
      setBanners(raw.banners);

      if (isLoggedIn && uid) {
        const continueWatchlistData = await fetchContinueWatchingData(isLoggedIn ? uid : 0);
        processed = getProcessedPlaylistsWithContinueWatch(processed, continueWatchlistData);
      }

      setData(processed);
    } catch (e) {
      console.error("Failed to load homepage", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRows = useThrottle(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const raw = await fetchPlaylistPage(uid, page + 1);
      const processed = getProcessedPlaylists(raw, horizontalLimit);
      setData((prev) => [...prev, ...processed]);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error("Pagination error", e);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  const handleAssetFocus = (data) => {
    setFocusedAssetData(data);
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
  };
};

export { useAsset, useContentRow, useMovieHomePage };
