import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";
import { getProcessedPlaylists, useThrottle } from "../../Common";
import { fetchHomePageData, fetchPlaylistPage } from "../Service/MovieHomePageService";


const useMovieHomePage = (focusKeyParam, history) => {
    const { ref, focusKey } = useFocusable({
      focusKey: focusKeyParam,
      trackChildren: true,
      saveLastFocusedChild: true,
    });
  
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [userId] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef(null);
    const horizontalLimit = 10;
  
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
  
    },
    [scrollingRowRef]
  );
  

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  };
};

const useAsset = (image) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { imgRef, shouldLoad, imageUrl } = useIntersectionImageLoader(image);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Stop shimmer
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

export const useContentWithBanner  = (focusKey, onFocus) =>{
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
      
      const [focusedAssetData, setFocusedAssetData] = useState(null);
      
        const handleAssetFocus = (data) => {
          setFocusedAssetData(data);
        };

       return {
        ref,
        currentFocusKey,
        hasFocusedChild,
        focusedAssetData,
        handleAssetFocus
       } 
    
} 

export { useAsset, useContentRow, useMovieHomePage };
