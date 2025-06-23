import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useEffect, useRef, useState } from 'react';

export default function ImageSlider({ data = [], onEnterPress }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageCacheRef = useRef({});

  const {
    ref,
    focusKey: currentFocusKey,
    focused,
    focusSelf,
  } = useFocusable({
    focusKey: 'IMAGE_SLIDER',
    trackChildren: true,
    focusable: data.length > 0,
    onEnterPress: () => {
      if (onEnterPress) {
        onEnterPress(data[currentIndex]);
      }
      return true;
    },
    onArrowPress: (direction) => {
      if (direction === 'left') {
        setCurrentIndex((prev) => Math.max((prev - 1),0));
        return currentIndex === 0 ? true : false;
        // return true
      } else if (direction === 'right') {
        setCurrentIndex((prev) => Math.min((prev + 1),data.length -1));
        return true;
      }
      return true;
    },
  });

  // Focus the component on mount
  useEffect(() => {
    focusSelf();
  }, []);

  // Preload and cache images
  useEffect(() => {
    data.forEach((item) => {
      const url = item?.bannerImage;
      if (url && !imageCacheRef.current[url]) {
        const img = new Image();
        img.src = url;
        imageCacheRef.current[url] = img;
      }
    });
  }, [data]);

  if (!data.length) return null;

  const currentImageUrl = data[currentIndex]?.bannerImage;
  const imageSrc = imageCacheRef.current[currentImageUrl]?.src || currentImageUrl;

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        tabIndex={-1}
        style={{
          ...styles.sliderContainer,
          border: focused ? '4px solid #00aced' : '4px solid transparent',
        }}
      >
        <img
          src={imageSrc}
          alt={`Slide ${currentIndex}`}
          style={styles.image}
        />
      </div>
    </FocusContext.Provider>
  );
}

const styles = {
  sliderContainer: {
    width: '100%',
    // height: '500px',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outline: 'none',
    boxSizing: 'border-box',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
};
