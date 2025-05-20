import React, { useRef, useCallback, useEffect, useState, memo } from "react";
import { FixedSizeList as List } from "react-window";
import {
  useFocusable,
  setFocus,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import throttle from "lodash/throttle";
import "./virtualList.css";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 220;
const THUMBNAIL_GAP = 50;
const ITEM_SIZE = THUMBNAIL_WIDTH + THUMBNAIL_GAP;
const OVERSCAN_COUNT = 12;
const THUMBNAIL_INTERVAL = 10;

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

const getThumbnailUrl = (baseUrl, index) => {
  if (index < 0) return;
  return `${baseUrl}thumbnail${String(index + 1).padStart(9, "0")}.jpg`;
};

const preloadImageBlob = (url) => {
  if (imageBlobCache.has(url)) return;

  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
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

const ThumbnailItem = memo(
  ({
    index,
    parentFocusKey,
    scrollToCenter,
    baseUrl,
    onFocus,
    onEnterPress,
  }) => {
    const url = getThumbnailUrl(baseUrl, index);
    const [imageSource, setImageSource] = useState(
      imageBlobCache.get(url) || null
    );
    const { ref, focused } = useFocusable({
      focusKey: `THUMB_${index}`,
      //   parentFocusKey,
      onEnterPress: () => {
        onEnterPress(index);
      },
      onFocus: () => {
        scrollToCenter(index);
        onFocus(index); // Pass the time to the parent
      },
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
          padding: "5px",
        }}
      >
        <div
          className={`thumbnail ${focused ? "focused" : ""}`}
        //transition={{ type: "spring", stiffness: 300 }}
        >
          {imageSource ? (
            <img
              src={imageSource}
              alt={`Thumb ${index}`}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          ) : (
            <div className="thumbnail-placeholder" />
          )}
        </div>
      </div>
    );
  }
);

const VirtualizedThumbnailStrip = ({
  thumbnailBaseUrl,
  videoRef,
  onClose,
  virtualSeekTimeRef,
  isVisible,
  focusKey,
  resetInactivityTimeout
}) => {
  const [totalThumbnails, setTotalThumbnails] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1000);
  const listRef = useRef();
  const initialIndexRef = useRef(null);
  const {
    ref,
    focusKey: currentFocusKey,
  } = useFocusable({
    focusKey,
    trackChildren: false,
    saveLastFocusedChild: false,
    onFocus: () => {
      initialIndexRef.current = null;
      const currentIndex = getCurrentThumbnailIndex();
      setTimeout(() => {
        initialIndexRef.current = currentIndex;
        scrollToCenter(currentIndex);
        setFocus(`THUMB_${currentIndex}`);
      }, 0);
    },
  });

  useEffect(() => {
    clearCacheOnBaseUrlChange(thumbnailBaseUrl);
  }, [thumbnailBaseUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const duration = video.duration;
      if (duration && !isNaN(duration)) {
        const total = Math.ceil(duration / THUMBNAIL_INTERVAL);
        setTotalThumbnails(total);
      }
    };

    const handleTimeUpdate = () => {
      const currentIndex = Math.floor(video.currentTime / THUMBNAIL_INTERVAL);
      scrollToCenter(currentIndex);
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
      handleTimeUpdate(); // scroll initially
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoRef]);


  const getCurrentThumbnailIndex = () => {
    const currentTime = videoRef.current?.currentTime || 0;
    return Math.floor(currentTime / THUMBNAIL_INTERVAL);
  };

  useEffect(() => {
    if (totalThumbnails > 0) {
      throttledPreload(thumbnailBaseUrl, 0, 10);
    }
  }, [totalThumbnails, thumbnailBaseUrl]);

  useEffect(() => {
    if (!thumbnailBaseUrl || !videoRef.current) return;

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToCenter = useCallback(
    (index) => {
      listRef.current?.scrollToItem(index, "center");
      const preloadStart = Math.max(0, index - 30);
      const preloadEnd = Math.min(totalThumbnails - 1, index + 30);
      throttledPreload(thumbnailBaseUrl, preloadStart, preloadEnd);
    },
    [thumbnailBaseUrl]
  );

  const onThumbnailFocus = useCallback(
    (index) => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }

      if (
        initialIndexRef.current != null &&
        initialIndexRef.current != index
      ) {
        initialIndexRef.current = index;
      } else {
        initialIndexRef.current = -1; // user has not changed the thumbnail yet
      }

      if (initialIndexRef.current != -1) {
        virtualSeekTimeRef.current = index * THUMBNAIL_INTERVAL;
      }
    },
    [videoRef]
  );

  const onThumbnailEnterHandler = async (index) => {
    const video = videoRef.current;
    if (video) {
      try {
        if (!video.paused) {
          await video.pause();
        }
        if (initialIndexRef.current !== -1) {
          video.currentTime = index * THUMBNAIL_INTERVAL;
        }
        if (video.paused) {
          await video.play();
        }
      } catch (err) {
        console.warn("Playback failed:", err);
      } finally {
        initialIndexRef.current = null;
        virtualSeekTimeRef.current = null;
        resetInactivityTimeout();
      }
    }
  };

  const renderItem = useCallback(({ index, style }) => (
    <div style={style} key={index}>
      <ThumbnailItem
        index={index}
        parentFocusKey={currentFocusKey}
        scrollToCenter={scrollToCenter}
        baseUrl={thumbnailBaseUrl}
        onFocus={onThumbnailFocus}
        onEnterPress={onThumbnailEnterHandler}
      />
    </div>
  ), [currentFocusKey, scrollToCenter, thumbnailBaseUrl, onThumbnailFocus, onThumbnailEnterHandler]);


  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="thumbnail-strip-container"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        {totalThumbnails > 0 && (
          <List
            ref={listRef}
            height={THUMBNAIL_HEIGHT + 20}
            width={window.innerWidth}
            itemCount={totalThumbnails}
            itemSize={ITEM_SIZE}
            layout="horizontal"
            overscanCount={OVERSCAN_COUNT}
          >
            {renderItem}
          </List>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default VirtualizedThumbnailStrip;
