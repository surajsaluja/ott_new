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
    isVisible,
    isThumbnailStripVisible,
    handleThumbnialStripVisibility, 
    isSeeking,
togglePlayPause }) => {
    const virtualSeekTimeRef = useRef(null);
    const [isComponentFocused, setIsComponentFocused] = useState(false);
    const [isProgressBarFocusable, setIsProgressBarFocusable] = useState(true);
    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey,
        trackChildren: false,
        saveLastFocusedChild: false,
        onFocus: () => {
            setIsComponentFocused(true);
            virtualSeekTimeRef.current = null;
        },
        onBlur: () => {
            setIsComponentFocused(false);
            virtualSeekTimeRef.current = null;
        }
    });

    const onClose = () => {
        virtualSeekTimeRef.current = null;
        handleThumbnialStripVisibility(false);
        setIsSeeking(false);
    }

    useEffect(() => {
        setIsProgressBarFocusable(thumbnailBaseUrl == null);
    }, [thumbnailBaseUrl]);

    useEffect(() => {

        if (isComponentFocused && !isSeeking) {
            setFocus(VIDEO_PROGRESS_FOCUSKEY);
        }
    }, [isComponentFocused, isSeeking]);

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className="thumbnails_strip" style={{ opacity: isVisible ? 1 : 0 }}>
                    {thumbnailBaseUrl && <VirtualizedThumbnailStrip
                        videoRef={videoRef}
                        thumbnailBaseUrl={thumbnailBaseUrl}
                        onClose={onClose}
                        virtualSeekTimeRef={virtualSeekTimeRef}
                        focusKey={THUMBNAIL_STRIP_FOCUSKEY}
                        setIsSeeking={setIsSeeking}
                        handleThumbnialStripVisibility={handleThumbnialStripVisibility}
                        isThumbnailStripVisible = {isThumbnailStripVisible}
                    />}

                <VideoProgressBar
                    videoRef={videoRef}
                    virtualSeekTimeRef={virtualSeekTimeRef}
                    isFocusable={true}
                    focusKey={VIDEO_PROGRESS_FOCUSKEY}
                    setIsSeeking={setIsSeeking}
                    handleThumbnialStripVisibility={handleThumbnialStripVisibility}
                    thumbnailStripFocusKey = {THUMBNAIL_STRIP_FOCUSKEY}
                    isStripFocusable = {thumbnailBaseUrl != null}
                    togglePlayPause = {togglePlayPause}
                     />
            </div>
        </FocusContext.Provider>
    );
}

export default VirtualThumbnailStripWithSeekBar