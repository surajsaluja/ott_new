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
    return `${baseUrl}${String(index + 1).padStart(9, '0')}.jpg`;
}

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

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs]
        .map(unit => String(unit).padStart(2, '0'))
        .join(':');
};

const VideoProgressBar = ({ videoRef, virtualSeekRef, isFocusable = true, focusKey }) => {
    const [progress, setProgress] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const [buffered, setBuffered] = useState(0);

    const { ref, focused } = useFocusable({
        focusKey,
        focusable: isFocusable
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            const virtualTime = virtualSeekRef.current;
            const currentTime = virtualTime != null ? virtualTime : video.currentTime;
            const duration = video.duration || 1;

            setDisplayTime(currentTime);
            setProgress((currentTime / duration) * 100);
        };

        const updateBuffered = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration || 1;
                setBuffered((bufferedEnd / duration) * 100);
            }
        };

        const interval = setInterval(updateProgress, 100); // update even if paused and using virtual ref

        video.addEventListener("progress", updateBuffered);

        return () => {
            clearInterval(interval);
            video.removeEventListener("progress", updateBuffered);
        };
    }, [videoRef, virtualSeekRef]);

    return (
        <div ref={ref} className="seekbar-wrapper">
            <span className="time">{formatTime(displayTime)}</span>
            <div className="seekbar-container">
                <div className="buffered" style={{ width: `${buffered}%` }} />
                <div className="progress" style={{ width: `${progress}%` }} />
                {focused && (
                    <div
                        className={`progress-circle ${focused ? "focused" : ""}`}
                        style={{ left: `${progress}%` }}
                    />
                )}
            </div>
            <span className="time">
                {videoRef.current && !isNaN(videoRef.current.duration)
                    ? formatTime(videoRef.current.duration)
                    : "00:00:00"}
            </span>
        </div>
    );
};

const VirtualizedThumbnailStrip = ({ thumbnailBaseUrl, videoRef, onClose }) => {

    const [totalThumbnails, setTotalThumbnails] = useState(0);

    const virtualSeekTimeRef = useRef(null);

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

    useEffect(() => {

        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            const duration = video.duration;
            if (duration && duration > 0) {
                const total = Math.ceil(duration / THUMBNAIL_INTERVAL);
                setTotalThumbnails(total);
            }
        };
    
        // In case metadata is already available (e.g., cached)
        if (video.readyState >= 1) {
            handleLoadedMetadata();
        } else {
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
        }

        if (videoRef.current && typeof videoRef.current.currentTime === 'number') {
            if (!videoRef.current.paused) {
                const currentIndex = Math.floor(videoRef.current.currentTime / 10);
                listRef.current?.scrollToItem(currentIndex, 'center');
            }
        }
    
        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };

        
    }, [videoRef]);

    useEffect(() => {
        if (totalThumbnails > 0) {
            throttledPreload(thumbnailBaseUrl, 0, 10);
        }
    }, [totalThumbnails, thumbnailBaseUrl]);
    

    const scrollToCenter = useCallback((index) => {
        listRef.current?.scrollToItem(index, 'center');
        throttledPreload(thumbnailBaseUrl, index - 5, index + 5); // preload nearby
    }, [thumbnailBaseUrl]);

    const onThumbnailFocus = useCallback((index) => {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
        const previewTime = index * THUMBNAIL_INTERVAL;
        virtualSeekTimeRef.current = previewTime;
    }, [videoRef]);



    const onThumbnailEnterHandler = async (index) => {
        const video = videoRef.current;
        if (video) {
            try {
                await video.pause();
                video.currentTime = index * 10;
                await video.play();
            } catch (err) {
                console.warn('Playback failed:', err);
            }
            finally {
                virtualSeekTimeRef.current = null;
                onClose();
            }
        }
    }


    const renderItem = ({ index, style }) => (
        <div style={style} key={index}>
            <ThumbnailItem
                index={index}
                parentFocusKey={focusKey}
                scrollToCenter={scrollToCenter}
                baseUrl={thumbnailBaseUrl}
                onFocus={onThumbnailFocus}
                onEnterPress={onThumbnailEnterHandler}
            />
        </div>
    );

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
            <VideoProgressBar
                videoRef={videoRef}
                virtualSeekRef={virtualSeekTimeRef}
                focusKey={'SeekBar_Progress'}
                isFocusable={!thumbnailBaseUrl || thumbnailBaseUrl == null}
            />
        </div>
    );
};

export default VirtualizedThumbnailStrip;
