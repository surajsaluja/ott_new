import { useRef, useState, useEffect, useContext } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { getCachedImage, preloadImage } from "../../../../Utils/imageCache";
import { FocusedAssetUpdateContext } from "../../../../Context/movieBannerContext";

const LEFT_RIGHT_DELAY = 100;
const UP_DOWN_DELAY = 150;

const useAssetCard = (
  assetData,
  dimensions,
  onAssetFocus,
  lastAssetChangeRef,
  lastRowChangeRef,
  onEnterPress,
  focusKey,
  changeBanner,
  parentScrollingRef
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cachedImage, setCachedImage] = useState(null);
  const [imageUrl, setImg] = useState(dimensions && dimensions.displayImgType
    ? (dimensions.displayImgType === 'web'
      ? assetData.webThumbnail
      : assetData.mobileThumbnail)
    : assetData.webThumbnail)

  const shouldLoad = true;

  const updateFocusedAssetContextValue = useContext(FocusedAssetUpdateContext);

  useEffect(() => {
    if (!imageUrl) return;

    const cached = getCachedImage(imageUrl);
    if (cached) {
      setCachedImage(cached);
      setIsLoaded(true);
    } else if (shouldLoad) {
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
  }, [imageUrl]);

  function smoothScrollTo(element, target, duration = 50) {
  const start = element.scrollLeft;
  const change = target - start;
  const startTime = performance.now();

  function animateScroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // easeInOut

    element.scrollLeft = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}


  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress,
    onFocus: () => {
      const el = ref.current.offsetParent;
      if (el) {
        console.log('<<< focused');
        // Horizontal scroll container
        const horizontalContainer = el.offsetParent;

        // Fallback to grandparent for vertical scroll
        const verticalContainer = parentScrollingRef == null ? document.getElementById("contentRowWrapper") : parentScrollingRef.current;
        const containerId  = verticalContainer.id;

        const itemRect = el.getBoundingClientRect();

        // Scroll padding
        const verticalScrollPadding = 40;
        const horizonatalScrollPadding  = 40;

        // --- Horizontal scroll ---
        if (horizontalContainer) {
          const containerRect = horizontalContainer.getBoundingClientRect();
          const containerWidth = horizontalContainer.clientWidth;
          const scrollLeft = horizontalContainer.scrollLeft;
          const offsetLeft = el.offsetLeft;
          const itemWidth = itemRect.width;

          console.log('<<scrolled');

          if (offsetLeft < scrollLeft + horizonatalScrollPadding) {
        horizontalContainer.scrollLeft = offsetLeft - horizonatalScrollPadding;
          } else if (offsetLeft + itemWidth > scrollLeft + containerWidth - horizonatalScrollPadding) {
        horizontalContainer.scrollLeft = offsetLeft + itemWidth - containerWidth + horizonatalScrollPadding;
          }
        }

        if(containerId === 'full-page-asset-scroll-container' && parentScrollingRef != null){
          let top =  el?.offsetTop - parentScrollingRef?.current?.offsetTop - 20;
          parentScrollingRef.current.scrollTop = top;
        }else if (verticalContainer) {
          const containerRect = verticalContainer.getBoundingClientRect();
          const containerHeight = verticalContainer.clientHeight;
          const scrollTop = verticalContainer.scrollTop;
          const offsetTop = horizontalContainer.offsetTop; // relative to vertical container
          const itemHeight = itemRect.height;

          if (offsetTop < scrollTop + verticalScrollPadding) {
            verticalContainer.scrollTop = offsetTop - verticalScrollPadding;
          } else if (offsetTop + itemHeight > scrollTop + containerHeight - verticalScrollPadding) {
            verticalContainer.scrollTop = offsetTop + itemHeight - containerHeight + verticalScrollPadding;
          }
        }

        console.log('chnage Banner value in asset', changeBanner)
        if(changeBanner == true){
        updateFocusedAssetContextValue(assetData);
        }
      }
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

  useEffect(() => {
    console.log('<<< asset rendered');
  })

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
    ref,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    focused,
    cachedImage
  };
};

export default useAssetCard;