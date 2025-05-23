import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useFocusable, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import { motion } from 'framer-motion';
import throttle from 'lodash/throttle';
import './virtualList.css';

const THUMBNAIL_WIDTH = 350;
const THUMBNAIL_HEIGHT = 250;
const THUMBNAIL_GAP = 50;
const ITEM_SIZE = THUMBNAIL_WIDTH + THUMBNAIL_GAP;
const OVERSCAN_COUNT = 12;

const imageBlobCache = new Map();
let currentBaseUrl = null;

const clearCacheOnBaseUrlChange = (newBaseUrl) => {
  if (newBaseUrl === currentBaseUrl) return;

  for (const [url, blobUrl] of imageBlobCache.entries()) {
    if (url.startsWith(currentBaseUrl)) {
      URL.revokeObjectURL(blobUrl);
      imageBlobCache.delete(url);
    }
  }
  currentBaseUrl = newBaseUrl;
};

const getThumbnailUrl = (baseUrl, index) =>
  `${baseUrl}${String(index + 1).padStart(9, '0')}.jpg`;

const preloadImageBlob = (url) => {
  if (imageBlobCache.has(url)) return;

  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      imageBlobCache.set(url, objectUrl);
    })
    .catch(() => {
      imageBlobCache.set(url, null); // mark as failed
    });
};

const preloadImageRange = (baseUrl, start, stop) => {
  for (let i = start; i <= stop; i++) {
    preloadImageBlob(getThumbnailUrl(baseUrl, i));
  }
};

const throttledPreload = throttle(preloadImageRange, 200);

const ThumbnailItem = memo(({ index, parentFocusKey, scrollToCenter, baseUrl, onFocus, onEnterPress }) => {
  const url = getThumbnailUrl(baseUrl, index);
  const [imageSource, setImageSource] = useState(imageBlobCache.get(url) || null);
  const { ref, focused } = useFocusable({
    focusKey: `THUMB_${index}`,
    parentFocusKey,
    onEnterPress: () => {
      onEnterPress();
    },
    onFocus: () => {scrollToCenter(index); onFocus()},
  });

  useEffect(() => {
    const cached = imageBlobCache.get(url);
    if (cached) {
      setImageSource(cached);
    } else {
      preloadImageBlob(url);
    }
  }, [url]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cached = imageBlobCache.get(url);
      if (cached && cached !== imageSource) {
        setImageSource(cached);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [url, imageSource]);

  return (
    <div
      ref={ref}
      style={{
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        marginRight: THUMBNAIL_GAP,
        padding: '5px',
      }}
    >
      <motion.div
        className={`thumbnail ${focused ? 'focused' : ''}`}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {imageSource ? (
          <img src={imageSource} alt={`Thumb ${index}`} style={{ width: '100%', height: '100%', display: 'block' }} />
        ) : (
          <div className="thumbnail-placeholder" />
        )}
      </motion.div>
    </div>
  );
});

// const VirtualizedThumbnailStrip = ({
//     thumbnailBaseUrl,
//     currentTime,
//     totalThumbnails,
//     onThumbnailFocus,
//     onEnter,
//   }) => {
//     const listRef = useRef();
  
//     const itemSize = 150;
  
//     const { ref, focused, focusKey } = useFocusable({
//       onEnterPress: onEnter,
//       trackChildren: true,
//     });
  
//     const scrollToCurrent = useCallback(() => {
//       if (listRef.current && currentTime !== null) {
//         const index = Math.floor(currentTime / 10);
//         listRef.current.scrollToItem(index, "center");
//       }
//     }, [currentTime]);
  
//     useEffect(() => {
//       scrollToCurrent();
//     }, [scrollToCurrent]);
  
//     const renderItem = ({ index, style }) => {
//       const thumbTime = index * 10;
//       const src = `${thumbnailBaseUrl}${String(index).padStart(5, "0")}.jpg`;
  
//       return (
//         <div
//           className="thumbnail-item"
//           style={style}
//           onFocus={() => onThumbnailFocus(index)}
//         >
//           <img src={src} alt={`thumb-${index}`} />
//           <p>{new Date(thumbTime * 1000).toISOString().substr(11, 8)}</p>
//         </div>
//       );
//     };
  
//     return (
//       <div ref={ref} className="thumbnail-strip">
//         <List
//         ref={listRef}
//         height={THUMBNAIL_HEIGHT + 30}
//         width={window.innerWidth}
//         itemCount={totalThumbnails}
//         itemSize={ITEM_SIZE}
//         layout="horizontal"
//         overscanCount={OVERSCAN_COUNT}
//         >
//           {renderItem}
//         </List>
//       </div>
//     );
//   };
  

const VirtualizedThumbnailStrip = ({ 
    thumbnailBaseUrl,
        seekTime,
        totalThumbnails,
        onThumbnailFocus,
        onEnter,}) => {
  const listRef = useRef();
  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey: 'THUMBNAIL_STRIP',
    trackChildren: true,
    saveLastFocusedChild: true,
    isFocusBoundary: true,
  });

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  useEffect(() => {
    clearCacheOnBaseUrlChange(thumbnailBaseUrl);
  }, [thumbnailBaseUrl]);

  const scrollAndFocus = useCallback(throttle((index) => {
    // listRef.current?.scrollToItem(index, 'center');
    // setFocus(`THUMB_${index}`);
    const currentFocus = document.activeElement?.getAttribute('data-focus-key');
    if (currentFocus !== `THUMB_${index}`) {
      setTimeout(() => {
        listRef.current?.scrollToItem(index, 'center');
        setFocus(`THUMB_${index}`);
      }, 200);
    }
  }, 200), []);

  useEffect(() => {
    if (typeof seekTime === 'number') {
      const currentIndex = Math.floor(seekTime / 10);
      scrollAndFocus(currentIndex);
    }
  }, [seekTime, scrollAndFocus]);  
  
  
  const scrollToCenter = useCallback((index) => {
    listRef.current?.scrollToItem(index, 'center');
    throttledPreload(thumbnailBaseUrl, index - 5, index + 5); // preload nearby
  }, [thumbnailBaseUrl]);

  const renderItem = useCallback(({ index, style }) => (
    <div style={style} key={index}>
      <ThumbnailItem
        index={index}
        parentFocusKey={focusKey}
        scrollToCenter={scrollToCenter}
        baseUrl={thumbnailBaseUrl}
        onFocus={() => onThumbnailFocus(index)}
        onEnterPress={onEnter}
      />
    </div>
  ), [focusKey, scrollToCenter, thumbnailBaseUrl, onThumbnailFocus, onEnter]);
  

  return (
    <div ref={ref} className="thumbnail-strip-container">
      <List
        ref={listRef}
        height={THUMBNAIL_HEIGHT + 30}
        width={window.innerWidth}
        itemCount={totalThumbnails}
        itemSize={ITEM_SIZE}
        layout="horizontal"
        overscanCount={OVERSCAN_COUNT}
      >
        {renderItem}
      </List>
    </div>
  );
};

export default VirtualizedThumbnailStrip;
