import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useEffect, useRef, useState } from 'react';
import './index.css'

export default function ImageSlider({ data = [], onBannerEnterPress = () => {}, onBannerFocus = () => {}, focusKey }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageCacheRef = useRef({});

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

  // Focus the component on mount if data exists
  useEffect(() => {
    if (data.length > 0) {
      focusSelf();
    }
  }, [data.length]);

  // Preload and cache images
  useEffect(() => {
    data && data.forEach((item) => {
      const url = item?.bannerImage;
      if (url && !imageCacheRef.current[url]) {
        const img = new Image();
        img.src = url;
        imageCacheRef.current[url] = img;
      }
    });
  }, [data]);

  // Fallback rendering to prevent ref-null registration
  if (!data.length) {
    return (
      <div ref={ref} />
    );
  }

  const currentImageUrl = data[currentIndex]?.bannerImage;
  const imageSrc = imageCacheRef.current[currentImageUrl]?.src || currentImageUrl;

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        className='slider-container'
      >
        <div  className='slider-image-container' style={{borderColor: focused ? 'white' : 'transparent'}}>
        <img
          src={imageSrc}
          alt={`Slide ${currentIndex}`}
          className='slider-image'
        />
        </div>
      </div>
    </FocusContext.Provider>
  );
}

const styles = {
  sliderContainer: {
    width: '100%',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outline: 'none',
    boxSizing: 'border-box',
    padding : '10px'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
};
