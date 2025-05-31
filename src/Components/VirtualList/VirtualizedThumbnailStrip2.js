import { useEffect, useRef, useState } from "react";
import { useFocusable, FocusContext, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import VirtualizedThumbnailStrip from "./VirtualizedThumbnailStripV2";
import VideoProgressBar from "./VideoProgressBarV2";
import './virtualList.css';

const THUMBNAIL_STRIP_FOCUSKEY = 'STRIP_THUMBNAIL';
const VIDEO_PROGRESS_FOCUSKEY = 'PROGRESS_VIDEO';

const VirtualThumbnailStripWithSeekBar = ({
    videoRef,
    thumbnailBaseUrl,
    focusKey,
    setIsSeeking,
    setIsSeekbarVisible,
    isVisible,
    isThumbnailStripVisible,
    setIsThumbnailStripVisible
}) => {
    const virtualSeekTimeRef = useRef(null);
    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey,
        trackChildren: true,
        saveLastFocusedChild: false,
        onFocus: () => {
            setIsSeekbarVisible(true);
            virtualSeekTimeRef.current = null;
        },
        onBlur: () => {
            setIsSeekbarVisible(false);
            setIsThumbnailStripVisible(false);
            virtualSeekTimeRef.current = null;
        }
    });

    const onClose = () => {
        virtualSeekTimeRef.current = null;
        setIsSeeking(false);
        setIsThumbnailStripVisible(false);
    };

    // Auto-focus progress bar when component is focused
    useEffect(() => {
        if (isVisible) {
            setFocus(VIDEO_PROGRESS_FOCUSKEY);
        }
    }, [isVisible]);

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className="thumbnails_strip" style={{ opacity: isVisible ? 1 : 0 }}>
                {/* Render the thumbnail strip only if the video has thumbnails */}
                    <VirtualizedThumbnailStrip
                        videoRef={videoRef}
                        thumbnailBaseUrl={thumbnailBaseUrl}
                        onClose={onClose}
                        virtualSeekTimeRef={virtualSeekTimeRef}
                        focusKey={THUMBNAIL_STRIP_FOCUSKEY}
                        isVisible={isThumbnailStripVisible}
                        setIsSeeking={setIsSeeking}
                        setIsThumbnailStripVisible={setIsThumbnailStripVisible}
                    />

                <VideoProgressBar
                    videoRef={videoRef}
                    virtualSeekTimeRef={virtualSeekTimeRef}
                    isFocusable={!isThumbnailStripVisible}
                    focusKey={VIDEO_PROGRESS_FOCUSKEY}
                    setIsSeeking={setIsSeeking}
                    setIsThumbnailStripVisible={setIsThumbnailStripVisible}
                    hasThumbnails={!!thumbnailBaseUrl}
                />
            </div>
        </FocusContext.Provider>
    );
};

export default VirtualThumbnailStripWithSeekBar;
