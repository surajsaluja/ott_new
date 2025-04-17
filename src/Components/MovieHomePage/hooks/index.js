import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";
import { getProcessedPlaylists, useThrottle, getProcessedPlaylistsWithContinueWatch } from "../../../Hooks/Common";
import { fetchContinueWatchingData, fetchHomePageData, fetchPlaylistPage } from "../../../Service";
import { useUserContext } from "../../../Context/userContext";

const useMovieHomePage = (focusKeyParam, history, data, setData, isLoading, setIsLoading) => {
    const { ref, focusKey } = useFocusable({
      focusKey: focusKeyParam,
      trackChildren: true,
      saveLastFocusedChild: true,
    });
  
    const [page, setPage] = useState(1);
    const [userId] = useState(675);
    const loadMoreRef = useRef(null);
    const horizontalLimit = 10;
  
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
    (element) => {
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
        saveLastFocusedChild: false,
        onFocus,
      });
      
      const [focusedAssetData, setFocusedAssetData] = useState(null);
      const [data, setData] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [banners, setBanners] = useState([]);
      const horizontalLimit = 10;
      const {profileInfo,uid,isLoggedIn} = useUserContext();

      useEffect(() => {
        loadInitialData();
      }, []);

      const loadInitialData = async () => {
        setIsLoading(true);
        try {
          const raw = await fetchHomePageData(isLoggedIn ? uid : 0);
          let processed = getProcessedPlaylists(raw.playlists, horizontalLimit);
          setBanners(raw.banners);
          if(isLoggedIn && uid){
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
      
        const handleAssetFocus = (data) => {
          setFocusedAssetData(data);
        };


       return {
        ref,
        currentFocusKey,
        hasFocusedChild,
        focusedAssetData,
        handleAssetFocus,
        data,
        setData,
        isLoading,
        setIsLoading,
        banners,
        setFocusedAssetData
       } 
    
} 

export { useAsset, useContentRow, useMovieHomePage };
