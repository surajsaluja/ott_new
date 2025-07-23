import { useEffect, useState, useRef } from "react";
import { fetchScreenSaverContent } from "../../../Service/MediaService";
import { sanitizeAndResizeImage, showModal } from "../../../Utils";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { getCachedImage, preloadImage } from "../../../Utils/imageCache";
import { CACHE_KEYS, getCache, SCREEN_KEYS } from "../../../Utils/DataCache";
import { getBannerPlayData, getTokenisedMedia } from "../../../Utils/MediaDetails";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useUserContext } from "../../../Context/userContext";
import { useBackArrayContext } from "../../../Context/backArrayContext";

const useScreenSaver = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screensaverResources, setScreensaverResources] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();
  const [cachedImage, setCachedImage] = useState(null);
  const { userObjectId, isLoggedIn } = useUserContext();

  const intervalRef = useRef(null);
  const isScreenSaverLoadedRef = useRef(false);

  const history = useHistory();

  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey: "SCREENSAVER" });

  const loadScreenSaverData = async () => {
    try {
      const cachedScreenSaverContent = getCache(CACHE_KEYS.SCREENSAVER_CONTENT.SCREENSAVER_DATA);
      if (cachedScreenSaverContent) {
        setScreensaverResources(cachedScreenSaverContent);
      } else {
        const response = await fetchScreenSaverContent();
        if (response?.isSuccess && response?.data) {
          const processed = response.data.map((el) => ({
            ...el,
            fullPageBanner: sanitizeAndResizeImage(el.fullPageBanner, 1280),
          }));
          setScreensaverResources(processed);
        } else {
          throw new Error(response?.message || "Failed to load screensaver data");
        }
      }
    } catch (err) {
      console.error("Screensaver load error:", err);
    }
  };

  useEffect(() => {
    if (isScreenSaverLoadedRef.current) return;
    loadScreenSaverData();
  }, []);

  useEffect(() => {
    if (screensaverResources.length > 0 && !isScreenSaverLoadedRef.current) {
      focusSelf();
      isScreenSaverLoadedRef.current = true;
    }
  }, [screensaverResources]);


  useEffect(() => {
    if (screensaverResources.length === 0) return;

    // Cycle through banners every 20 seconds
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screensaverResources.length);
    }, 20000);

    return () => clearInterval(intervalRef.current);
  }, [screensaverResources]);

  const currentImageUrl = screensaverResources[currentIndex]?.fullPageBanner;

  useEffect(() => {
    if (!currentImageUrl) return;

    const cached = getCachedImage(currentImageUrl);
    if (cached) {
      setCachedImage(cached);
      setIsLoaded(true);
      setHasError(false);
    } else {
      preloadImage(currentImageUrl)
        .then((img) => {
          setCachedImage(img);
          setIsLoaded(true);
          setHasError(false);
        })
        .catch((err) => {
          console.error("Screensaver preload error:", err);
          setHasError(true);
          setIsLoaded(true);
        });
    }
  }, [currentImageUrl]);

  // Preload next image
  useEffect(() => {
    if (!screensaverResources.length) return;
    const nextIndex = (currentIndex + 1) % screensaverResources.length;
    const nextImage = screensaverResources[nextIndex]?.fullPageBanner;
    if (nextImage && !getCachedImage(nextImage)) {
      preloadImage(nextImage).catch(() => { });
    }
  }, [currentIndex, screensaverResources]);

  const redirectToLogin = () => {
    history.replace('/login', { from: '/' });
  };

  const onWatchClipSS = async () => {
    const currentMedia = screensaverResources[currentIndex];
    if (isLoggedIn && userObjectId) {
      const openWebSeries = currentMedia.categoryID === 2 ? true : false;
      const itemWebSeriesId = 0;
      const res = await getBannerPlayData(currentMedia.mediaID, currentMedia.categoryID, itemWebSeriesId, openWebSeries, false, null);
      if (res?.isSuccess) {
        history.push("/play", {
          src: res.data.mediaDetail.mediaUrl,
          thumbnailBaseUrl: res.data.mediaDetail?.trickyPlayBasePath,
          title: res.data.mediaDetail?.title,
          mediaId: res.data.mediaDetail.mediaID,
          onScreenInfo: res.data.mediaDetail.onScreenInfo,
          skipInfo: res.data.mediaDetail.skipInfo,
          isTrailer: false,
          playDuration: res.data.mediaDetail?.playDuration,
          webSeriesId: res.data.mediaDetail.webSeriesId,
          episodes: res.data.mediaDetail?.episodes || []
        });
      } else {
        history.replace(`/detail/${currentMedia.categoryID}/${currentMedia.mediaID}/${currentMedia.webSeriesId ?? 0}/1`);
      }
    } else {
      history.replace('/login', {
        from: '/play', props: {
          mediaID: currentMedia.mediaID,
          categoryID: currentMedia.categoryID,
          webSeriesId: currentMedia.webSeriesId ?? 0,
          openWebSeries: 1,
          isTrailer: false
        }
      });
    }
  };

  const onMoreInfoItemClickSS = () => {
    const currentMedia = screensaverResources[currentIndex];
    if (isLoggedIn && userObjectId) {
      history.replace(`/detail/${currentMedia.categoryID}/${currentMedia.mediaID}/${currentMedia.webSeriesId ?? 0}/1`);

    } else {
      history.replace('/login', { from: `/detail/${currentMedia.categoryID}/${currentMedia.mediaID}/${currentMedia.webSeriesId ?? 0}/1` });
    }
  };

  useEffect(() => {
    setBackArray(SCREEN_KEYS.SCREEN_SAVER, false);
  }, []);

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.SCREEN_SAVER) {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

  return {
    ref,
    currentFocusKey,
    currentIndex,
    screensaverResources,
    cachedImage,
    isLoaded,
    hasError,
    onWatchClipSS,
    onMoreInfoItemClickSS,
  };
};

export default useScreenSaver;
