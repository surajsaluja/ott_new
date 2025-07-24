import { useState, useEffect } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { getCachedImage, preloadImage } from "../../../../Utils/imageCache";

const LEFT_RIGHT_DELAY = 400;
const UP_DOWN_DELAY = 400;

const useAssetCard = (
  assetData,
  dimensions,
  onAssetFocus, 
  lastAssetChangeRef, 
  lastRowChangeRef,
  onEnterPress,
  focusKey
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cachedImage, setCachedImage] = useState(null);
  const [imageUrl, setImg] =useState(dimensions && dimensions.displayImgType 
    ? (dimensions.displayImgType === 'web' 
      ? assetData.webThumbnail 
      : assetData.mobileThumbnail) 
    : assetData.webThumbnail)

    const shouldLoad = true;

  // Check cache when imageUrl changes
  useEffect(() => {
    if (!imageUrl) return;
    
    const cached = getCachedImage(imageUrl);
    if (cached) {
      setCachedImage(cached);
      setIsLoaded(true);
    } else if (shouldLoad) {
      // Preload image when it should be loaded
      preloadImage(imageUrl)
        .then(img => {
          setCachedImage(img);
          setIsLoaded(true);
        })
        .catch(error => {
          console.error('Image preload error:', error);
          setHasError(true);
          setIsLoaded(true);
        });
    }
  }, [imageUrl, shouldLoad]);

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress,
    onFocus: () => {
      onAssetFocus?.(ref.current, assetData);
    },
    onArrowPress: (direction) => {
      if (!focused) return false;
      if (direction === "left" || direction === "right") {
        return delayFocus(lastAssetChangeRef, LEFT_RIGHT_DELAY);
      }
      if (direction === 'up' || direction === 'down') {
        return delayFocus(lastRowChangeRef, UP_DOWN_DELAY);
      }
    },
    extraProps: { assetData },
  });

  useEffect(() => {
    if (!focused) return;
    const handleKeyUp = () => {
      lastAssetChangeRef.current = 0;
      lastRowChangeRef.current = 0;
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [focused]);

  function delayFocus(ref, delay) {
    if (ref && typeof ref.current !== 'undefined') {
      const now = Date.now();
      if (now - ref.current < delay) {
        return false;
      }
      ref.current = now;
    }
    return true; // allow move
  }

  const handleLoad = () => {
    if (!cachedImage) {
      setIsLoaded(true);
    }
  };

  const handleError = (e) => {
    console.error('Image load error:', e?.target?.src);
    setHasError(true);
    setIsLoaded(true);
  };

  return {
    // imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    ref,
    focused,
    cachedImage // Return the cached image if available
  };
};

export default useAssetCard;