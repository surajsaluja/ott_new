import React, { useRef, useCallback, memo, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { motion } from 'framer-motion';
import throttle from 'lodash/throttle';
import './virtualList.css';

const THUMBNAIL_WIDTH =350;
const THUMBNAIL_HEIGHT = 250;
const THUMBNAIL_GAP = 50;
const ITEM_SIZE = THUMBNAIL_WIDTH + THUMBNAIL_GAP;
const TOTAL_THUMBNAILS = 463;
const OVERSCAN_COUNT = 12

// Custom Map with event listener for updates
class ImageCache extends Map {
  constructor(entries) {
    super(entries);
    this.listeners = {};
  }

  set(key, value) {
    super.set(key, value);
    this._emit('update', key, value);
  }

  get(key) {
    return super.get(key);
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type].add(callback);
  }

  removeEventListener(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type].delete(callback);
    }
  }

  _emit(type, ...args) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(...args));
    }
  }
}

const virtualizedImageCache = new ImageCache();

const getThumbnailUrl = (index) =>
  `https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail${String(index).padStart(9, '0')}.jpg`;

const preloadImage = (url) => {
  if (virtualizedImageCache.get(url)) return;
  const img = new Image();
  virtualizedImageCache.set(url, 'loading');
  img.onload = () => {
    img.decode()
      .then(() => {
        virtualizedImageCache.set(url, img);
      })
      .catch(() => {
        virtualizedImageCache.set(url, null);
      });
  };
  img.onerror = () => {
    virtualizedImageCache.set(url, null);
  };
  img.src = url;
};

const preloadImageRange = (start, stop) => {
  for (let i = start; i <= stop; i++) {
    preloadImage(getThumbnailUrl(i));
  }
};

const throttledPreload = throttle(preloadImageRange, 200);

const ThumbnailItem = memo(({ index, parentFocusKey, scrollToCenter }) => {
  const url = getThumbnailUrl(index);
  const [imageSource, setImageSource] = useState(virtualizedImageCache.get(url) instanceof Image ? url : null);
  const { ref, focused } = useFocusable({
    focusKey: `THUMB_${index}`,
    parentFocusKey,
    onEnterPress: () => {
      console.log('Seek to second:', index * 10);
    },
    onFocus: () => scrollToCenter(index),
  });

  useEffect(() => {
    const cachedImage = virtualizedImageCache.get(url);
    if (cachedImage instanceof Image) {
      setImageSource(cachedImage.src);
    } else if (!cachedImage) {
      preloadImage(url);
      setImageSource(null);
    }
  }, [url]);

  useEffect(() => {
    const handleCacheUpdate = (newUrl, newImage) => {
      if (newUrl === url && newImage instanceof Image) {
        setImageSource(newImage.src);
      }
    };
    virtualizedImageCache.addEventListener('update', handleCacheUpdate);
    return () => {
      virtualizedImageCache.removeEventListener('update', handleCacheUpdate);
    };
  }, [url]);

  return (
    <div
      ref={ref}
      style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT, marginRight: THUMBNAIL_GAP, padding: '5px' }}
    >
      <motion.div
        className={`thumbnail ${focused ? 'focused' : ''}`}
        // animate={{ scale: focused ? 1.2 : 1 }}
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

const VirtualizedThumbnailStrip = () => {
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

  const scrollToCenter = useCallback((index) => {
    listRef.current?.scrollToItem(index, 'center');
  }, []);

  const renderItem = ({ index, style }) => (
    <div style={style} key={index}>
      <ThumbnailItem
        index={index}
        parentFocusKey={focusKey}
        scrollToCenter={scrollToCenter}
      />
    </div>
  );

  return (
    <div ref={ref} className="thumbnail-strip-container">
      <List
        ref={listRef}
        height={THUMBNAIL_HEIGHT + 30}
        width={window.innerWidth}
        itemCount={TOTAL_THUMBNAILS}
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