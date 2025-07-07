import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useEffect, useRef, useState } from 'react';
import { sanitizeAndResizeImage } from '../../../Utils';
import { getCachedImage, preloadImage } from '../../../Utils/imageCache';
import './index.css';

export default function ImageSlider({
  data = [],
  onBannerEnterPress = () => {},
  onBannerFocus = () => {},
  focusKey,
   setIsBannerLoaded = ()=>{}
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cachedImage, setCachedImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const {
    ref,
    focusKey: currentFocusKey,
    focused,
    focusSelf,
  } = useFocusable({
    focusKey,
    trackChildren: true,
    focusable: data.length > 0,
    onFocus: onBannerFocus,
    onEnterPress: () => {
      onBannerEnterPress?.(data[currentIndex]);
    },
    onArrowPress: (direction) => {
      if (direction === 'left') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        return currentIndex === 0 ? true : false;
      } else if (direction === 'right') {
        setCurrentIndex((prev) => Math.min(prev + 1, data.length - 1));
        return currentIndex === data.length - 1 ? true : false;
      }
      return true;
    },
  });

  const currentImageUrl = sanitizeAndResizeImage(data[currentIndex]?.bannerImage, 1280);

  // Load from cache or preload
  useEffect(() => {
    if (!currentImageUrl) return;

    const cached = getCachedImage(currentImageUrl);
    if (cached) {
      setCachedImage(cached);
      setIsLoaded(true);
      setIsBannerLoaded(true);
      return;
    }

    preloadImage(currentImageUrl)
      .then((img) => {
        setCachedImage(img);
        setIsLoaded(true);
        setHasError(false);
        setIsBannerLoaded(true);
      })
      .catch((err) => {
        console.error('Slider preload error:', err);
        setHasError(true);
        setIsLoaded(true);
        setIsBannerLoaded(true);
      });
  }, [currentImageUrl]);

  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacent = [currentIndex - 1, currentIndex + 1];
    preloadAdjacent.forEach((i) => {
      if (i >= 0 && i < data.length) {
        const url = sanitizeAndResizeImage(data[i]?.bannerImage, 1280);
        if (url && !getCachedImage(url)) {
          preloadImage(url).catch(() => {});
        }
      }
    });
  }, [currentIndex, data]);

  // useEffect(() => {
  //   if (data.length > 0) {
  //     focusSelf();
  //   }
  // }, [data.length]);

  if (!data.length) return <div ref={ref} />;

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="slider-container">
        <div className="slider-image-container">
          <div
            className="slider-image-wrapper"
            style={{ borderColor: focused && isLoaded ? 'white' : 'transparent' }}
          >
            <img
              src={cachedImage?.src || currentImageUrl}
              alt={`Slide ${currentIndex}`}
              className="slider-image"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                console.error('Image load failed:', currentImageUrl);
                setHasError(true);
                setIsLoaded(true);
              }}
            />
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
}
