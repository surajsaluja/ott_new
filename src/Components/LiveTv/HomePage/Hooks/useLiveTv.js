import { useState, useEffect } from "react";
import { fetchLiveTvHomePageData } from "../../../../Service/LiveTVService";
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
} from "../../../../Utils/DataCache"; 

export const useLiveTv = (focusKey) => {
  const [liveTvHomePageData, setLiveTvHomePageData] = useState([]);
  const [liveTvBannersData, setLiveTvBannersData] = useState([]);
  const [isTvDataLoading, setIsTvDataLoading] = useState(false);
  const history = useHistory();

  const { focusKey: currentFocusKey, ref } = useFocusable({
    focusKey,
    preferredChildFocusKey: "TV_BANNER_FOCUS_KEY",
    saveLastFocusedChild: false,
  });

  const { userObjectId, uid, isLoggedIn } = useUserContext();

  const loadInitialData = async () => {
    const HOME_KEY = CACHE_KEYS.LIVE_TV_PAGE.HOME_DATA;
    const BANNERS_KEY = CACHE_KEYS.LIVE_TV_PAGE.BANNERS_DATA;

    if (hasCache(HOME_KEY) && hasCache(BANNERS_KEY)) {
      setLiveTvHomePageData(getCache(HOME_KEY));
      setLiveTvBannersData(getCache(BANNERS_KEY));
      return;
    }

    setIsTvDataLoading(true);
    try {
      const liveTvResponse = await fetchLiveTvHomePageData();
      const processed = processLiveTvCategoriesToPlaylist(liveTvResponse.categories);

      setLiveTvHomePageData(processed);
      setLiveTvBannersData(liveTvResponse.banners);

      // Cache both processed and banner data
      setCache(HOME_KEY, processed);
      setCache(BANNERS_KEY, liveTvResponse.banners);
    } catch (e) {
      console.error("Failed to load homepage", e);
    } finally {
      setIsTvDataLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const redirectToLogin = () => {
    history.replace("/login", { from: "/" });
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

  const onBannerEnterPress = (selectedBanner) => {
    console.log("selected Banner Index", selectedBanner);
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
    onChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus,
  };
};
