import { useState, useEffect } from "react";
import { sanitizeAndResizeImage, showModal } from "../../../../Utils";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { fetchRadioHomePageData } from "../../../../Service/MediaService";
import { useUserContext } from "../../../../Context/userContext";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import {
  getCache,
  setCache,
  hasCache,
  CACHE_KEYS,
  SCREEN_KEYS
} from "../../../../Utils/DataCache";
import useOverrideBackHandler from "../../../../Hooks/useOverrideBackHandler";
import { useBackArrayContext } from "../../../../Context/backArrayContext";

export const useRadioHomePage = (focusKey) => {
  const [radioHomePageData, setRadioHomePageData] = useState([]);
  const [radioBannersData, setRadioBannersData] = useState([]);
  const [isRadioDataLoading, setIsRadioDataLoading] = useState(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const {setBackArray, backHandlerClicked,currentArrayStack, setBackHandlerClicked, popBackArray} = useBackArrayContext();

  const { userObjectId, isLoggedIn } = useUserContext();
  const history = useHistory();

  const {
    focusKey: currentFocusKey,
    ref,
    focusSelf
  } = useFocusable({
    focusKey,
    preferredChildFocusKey: 'RADIO_BANNER_FOCUS_KEY',
    saveLastFocusedChild: false
  });

  // useEffect(() => {
  //   if(isBannerLoaded && !isRadioDataLoading){
  //   focusSelf();
  //   }
  // }, [focusSelf, isBannerLoaded]);

  const loadInitialData = async () => {
    const { HOME_DATA, BANNERS_DATA } = CACHE_KEYS.RADIO;

    setCache(CACHE_KEYS.CURRENT_SCREEN,SCREEN_KEYS.HOME.RADIO_HOME_PAGE);

    // Use cached data if available
    if (hasCache(HOME_DATA) && hasCache(BANNERS_DATA)) {
      setRadioHomePageData(getCache(HOME_DATA));
      setRadioBannersData(getCache(BANNERS_DATA));
      return;
    }

    setIsRadioDataLoading(true);

    try {
      const radioResponse = await fetchRadioHomePageData();
      const banners = radioResponse.data.radioBanner;

      const modifiedItems = radioResponse.data.radioData.map((item) => ({
        ...item,
        webThumbnail: sanitizeAndResizeImage(item.imagePath, 250),
        mobileThumbnail: sanitizeAndResizeImage(item.imagePath, 250),
        playListId: 1,
        mediaID: item.id,
        category: 'Radio',
      }));

      const playlist = [{
        playListId: 1,
        playlistName: 'Radio',
        playListType: 'Radio',
        height: 250,
        width: 250,
        playlistItems: modifiedItems,
      }];

      // Store in cache
      setCache(HOME_DATA, playlist);
      setCache(BANNERS_DATA, banners);

      setRadioHomePageData(playlist);
      setRadioBannersData(banners);
    } catch (error) {
      console.error("Failed to load radio homepage", error);
    } finally {
      setIsRadioDataLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

  const onRadioChannelEnterPress = ({ assetData }) => {
    if (isLoggedIn && userObjectId) {
      history.push('/playRadio', {
        audioName: assetData.title,
        audioImage: assetData.imagePath,
        audioplayUrl: assetData.payhttpsURL,
      });
    } else {
      showModal('Login', 'You are not logged in !!', [
        { label: 'Login', action: redirectToLogin, className: 'primary' }
      ]);
    }
  };

  const onBannerEnterPress = (selectedBanner) => {
    console.log('selected Banner Index', selectedBanner);
  };

  const onBannerFocus = () => {
    ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

    useEffect(()=>{
    setBackArray(SCREEN_KEYS.HOME.RADIO_HOME_PAGE, true);
  },[]);

  useEffect(() => {
  if (backHandlerClicked) {
    const backId = currentArrayStack[currentArrayStack.length - 1];

    if (backId === SCREEN_KEYS.HOME.RADIO_HOME_PAGE) {
      history.replace('/home');
      popBackArray();
      setBackHandlerClicked(false);
    }
  }
}, [backHandlerClicked, currentArrayStack]);

  return {
    ref,
    currentFocusKey,
    radioHomePageData,
    radioBannersData,
    isRadioDataLoading,
    isBannerLoaded,
    onRadioChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus,
    setIsBannerLoaded
  };
};
