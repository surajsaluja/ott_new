import { useEffect, useState, useRef } from "react";
import { fetchScreenSaverContent } from "../../../Service/MediaService";
import { sanitizeAndResizeImage } from "../../../Utils";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { getCachedImage, preloadImage } from "../../../Utils/imageCache";
import { CACHE_KEYS, getCache } from "../../../Utils/DataCache";

const useScreenSaver = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screensaverResources, setScreensaverResources] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cachedImage, setCachedImage] = useState(null);

  const intervalRef = useRef(null);
  const isScreenSaverLoadedRef = useRef(false);

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
    }, 200000);

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

  const onWatchClipSS = () => {
    console.log("Watch Now clicked");
    // trigger player
  };

  const onMoreInfoItemClickSS = () => {
    console.log("More Details clicked");
    // open detail page
  };

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
