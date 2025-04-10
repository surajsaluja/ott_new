import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { fetchHomePageData, fetchPlaylistPage } from "../Service/MovieHomePageService";
import { getProcessedPlaylists, useThrottle } from "../../Common";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";

const useMovieContent = (focusKeyParam, history) => {
  // Focusable root
  const { ref, focusKey } = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const [data, setData] = useState([]);
  const [focusedAsset, setFocusedAsset] = useState({});
  const [page, setPage] = useState(1);
  const [userId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const horizontalLimit = 10;

  // Initial + Pagination
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const raw = await fetchHomePageData(userId);
      const processed = getProcessedPlaylists(raw, horizontalLimit);
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
      const raw = await fetchPlaylistPage(userId, page + 1);
      const processed = getProcessedPlaylists(raw, horizontalLimit);
      setData((prev) => [...prev, ...processed]);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error("Pagination error", e);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMoreRows();
      }
    }, { rootMargin: "300px", threshold: 0.5 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [data]);

  // Row Focus Scroll
  const onRowFocus = useCallback((element) => {
    if (element && ref.current) {
      const scrollTop = element.top - ref.current.offsetTop;
      ref.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [ref]);

  // Asset Press
  const onAssetPress = (item) => {
    console.log("Selected asset:", item.data);
    // history.push("/detail", item.data);
  };

  // Content Row Handling
  const useContentRowProps = (focusKey, onFocus) => {
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

    const onAssetFocus = useCallback(
      (assetData, element) => {
        if (element && scrollingRowRef.current) {
          const parentRect = scrollingRowRef.current.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();

          const scrollLeft =
            scrollingRowRef.current.scrollLeft +
            (elementRect.left - parentRect.left) -
            parentRect.width / 2 +
            elementRect.width / 2;

          scrollingRowRef.current.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }

        setFocusedAsset(assetData);
      },
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

  // Asset Image Loading
  const useAssetProps = (image) => {
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

  return {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data,
    loadMoreRef,
    isLoading,
    focusedAsset,
    useContentRowProps,
    useAssetProps,
  };
};

export default useMovieContent;
