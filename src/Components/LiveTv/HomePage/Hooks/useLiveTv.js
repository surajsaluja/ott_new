import { useState, useEffect } from "react";
import {
  fetchLiveTvHomePageData,
  fetchLiveTvScheduleWithDetail,
} from "../../../../Service/LiveTVService";
import { processLiveTvCategoriesToPlaylist } from "../../../../Utils";
import { useHistory } from "react-router-dom";
import { useUserContext } from "../../../../Context/userContext";
import { showModal } from "../../../../Utils";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import {
  getCache,
  setCache,
  hasCache,
  CACHE_KEYS,
  SCREEN_KEYS,
} from "../../../../Utils/DataCache";
import { useBackArrayContext } from "../../../../Context/backArrayContext";
import { useRetryModal } from "../../../../Context/RetryModalContext";

export const useLiveTv = (focusKey) => {
  const [liveTvHomePageData, setLiveTvHomePageData] = useState([]);
  const [liveTvBannersData, setLiveTvBannersData] = useState([]);
  const [isTvDataLoading, setIsTvDataLoading] = useState(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const history = useHistory();
  const {
    setBackArray,
    backHandlerClicked,
    currentArrayStack,
    setBackHandlerClicked,
    popBackArray,
  } = useBackArrayContext();
  const {
    openRetryModal,
    closeRetryModal,
    markRetryComplete,
    retrying,
    callerId,
  } = useRetryModal();

  const { focusKey: currentFocusKey, ref } = useFocusable({
    focusKey,
    preferredChildFocusKey: "TV_BANNER_FOCUS_KEY",
    saveLastFocusedChild: false,
  });

  const { userObjectId, uid, isLoggedIn } = useUserContext();

  const loadInitialData = async () => {
    const HOME_KEY = CACHE_KEYS.LIVE_TV_PAGE.HOME_DATA;
    const BANNERS_KEY = CACHE_KEYS.LIVE_TV_PAGE.BANNERS_DATA;

    setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.HOME.LIVE_TV_HOME_PAGE);

    if (hasCache(HOME_KEY) && hasCache(BANNERS_KEY)) {
      setLiveTvHomePageData(getCache(HOME_KEY));
      setLiveTvBannersData(getCache(BANNERS_KEY));
      return;
    }

    setIsTvDataLoading(true);
    try {
      const liveTvResponse = await fetchLiveTvHomePageData();
      const processed = processLiveTvCategoriesToPlaylist(
        liveTvResponse.categories
      );

      setLiveTvHomePageData(processed);
      setLiveTvBannersData(liveTvResponse.banners);
      closeRetryModal();

      // Cache both processed and banner data
      setCache(HOME_KEY, processed);
      setCache(BANNERS_KEY, liveTvResponse.banners);
    } catch (e) {
      console.error("Failed to load homepage", e);
      openRetryModal({
        id: "LIVE_TV_HOME",
        title: "Oops!",
        description: "Failed to fetch. Try again.",
      });
    } finally {
      setIsTvDataLoading(false);
      markRetryComplete();
    }
  };

   useEffect(() => {
    if (retrying == true && callerId == "LIVE_TV_HOME") {
      loadInitialData();
    }
  }, [retrying]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const redirectToLogin = () => {
    history.push("/login", { from: "/" });
  };

  const onChannelEnterPress = ({ assetData }) => {
    if (isLoggedIn && userObjectId) {
      history.push("/livetvschedule", assetData);
    } else {
      showModal("Login", "You are not logged in !!", [
        { label: "Login", action: redirectToLogin, className: "primary" },
      ]);
    }
  };

  useEffect(() => {
    setBackArray(SCREEN_KEYS.HOME.LIVE_TV_HOME_PAGE, true);
  }, []);

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.HOME.LIVE_TV_HOME_PAGE) {
        history.replace("/home");
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

  const onBannerEnterPress = async (selectedBanner) => {
    if (isLoggedIn && userObjectId) {
      const tvDataRes = await fetchLiveTvScheduleWithDetail(
        selectedBanner.channelHandle
      );
      if (tvDataRes && tvDataRes.isSuccess) {
        history.push("/livetvschedule", {
          image: tvDataRes?.data?.tvChannelImage,
          title: tvDataRes?.data?.tvChannelName,
          description: tvDataRes?.data?.description,
          channelId: tvDataRes?.data?.tvChannelId,
          channelHandle: selectedBanner?.channelHandle,
          id: tvDataRes?.data?.tvChannelId,
          name: tvDataRes?.data?.tvChannelName,
        });
      }
    } else {
      showModal("Login", "You are not logged in !!", [
        { label: "Login", action: redirectToLogin, className: "primary" },
      ]);
    }
  };

  const onBannerFocus = () => {
    ref.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    ref,
    currentFocusKey,
    liveTvHomePageData,
    liveTvBannersData,
    isTvDataLoading,
    isBannerLoaded,
    onChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus,
    setIsBannerLoaded,
  };
};
