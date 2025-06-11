import { useState, useEffect } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

const LEFT_RIGHT_DELAY = 300;
const UP_DOWN_DELAY = 500;

const useAssetCard = (assetData, dimensions, onAssetFocus, lastAssetChangeRef, lastRowChangeRef, onEnterPress) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgUrl = dimensions.displayImgType === 'web' ? assetData.webThumbnail : assetData.mobileThumbnail;
  const { imgRef, shouldLoad, imageUrl } = useIntersectionImageLoader(imgUrl || null);

  const { ref, focused } = useFocusable({
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
      console.log('key up');
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

  // This effect handles the background image loading state
  useEffect(() => {
    if (!shouldLoad || !imageUrl) return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      // handleError(); // If you still need this for other purposes
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, shouldLoad]);

  return {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
   ref,
   focused
  };
};

export default useAssetCard