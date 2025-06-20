import { useRef,useEffect, useState, useCallback } from "react";
import { useUserContext } from "../../../Context/userContext";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { fetchBannersBySection, fetchPlaylistPage, fetchContinueWatchingData } from "../../../Service/MediaService";
import { getProcessedPlaylists, getProcessedPlaylistsWithContinueWatch } from "../../../Utils";
import { useThrottle } from "../../../Utils";
import { useHistory } from "react-router-dom";
import { showModal } from "../../../Utils";
import useOverrideBackHandler from "../../../Hooks/useOverrideBackHandler";

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
  const { uid, isLoggedIn, userObjectId } = useUserContext();


  const settleTimerRef = useRef(null); // used to update the banner data after settle delay time
  const SETTLE_DELAY = 200;

  const history = useHistory();

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

  
  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

  const onAssetPress = (item) => {
    if (isLoggedIn && userObjectId) {
      if(item?.assetData?.isSeeMore && item?.assetData?.isSeeMore === true){
        history.push('/seeAll',{playListId : item?.assetData?.playListId, playListName : '' })
      }
      else{
      history.push(`/detail/${item?.assetData?.categoryID}/${item?.assetData?.mediaID}`);
      }
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