import { useEffect, useRef, useState } from "react";
import { useFocusable, FocusContext, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import VirtualizedThumbnailStrip from "./VirtualizedThumbnailStrip";
import VideoProgressBar from "./VideoProgressBar";
import './virtualList.css';
import useOverrideBackHandler from "../../Hooks/useOverrideBackHandler";

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
    setIsThumbnailStripVisible }) => {
    const virtualSeekTimeRef = useRef(null);
    const [isComponentFocused, setIsComponentFocused] = useState(false);
    const [isProgressBarFocusable, setIsProgressBarFocusable] = useState(true);
    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey,
        trackChildren: true,
        saveLastFocusedChild: false,
        onFocus: () => {
            setIsComponentFocused(true);
            setIsSeekbarVisible(true);
            setIsThumbnailStripVisible(true);
            virtualSeekTimeRef.current = null;
        },
        onBlur: () => {
            setIsComponentFocused(false);
            setIsSeekbarVisible(false);
            setIsThumbnailStripVisible(false);
            virtualSeekTimeRef.current = null;
        }
    });

    const onClose = () => {
        virtualSeekTimeRef.current = null;
        setIsThumbnailStripVisible(false);
        setIsSeeking(false);
    }

    // Close the drawer instead of navigating back
      useOverrideBackHandler(() => {
        onClose(); 
      });

    useEffect(() => {
        setIsProgressBarFocusable(thumbnailBaseUrl == null);
    }, [thumbnailBaseUrl]);

    useEffect(() => {

        if (isComponentFocused) {

            if (thumbnailBaseUrl == null) {
                setFocus(VIDEO_PROGRESS_FOCUSKEY);
            } else {
                setFocus(THUMBNAIL_STRIP_FOCUSKEY);
            }
        }
    }, [isComponentFocused])

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className="thumbnails_strip" style={{ opacity: isVisible ? 1 : 0 }}>
                {!isProgressBarFocusable &&
                    <VirtualizedThumbnailStrip
                        videoRef={videoRef}
                        thumbnailBaseUrl={thumbnailBaseUrl}
                        onClose={onClose}
                        virtualSeekTimeRef={virtualSeekTimeRef}
                        focusKey={THUMBNAIL_STRIP_FOCUSKEY}
                        isVisible={isComponentFocused && !isProgressBarFocusable && isThumbnailStripVisible}
                        setIsSeeking={setIsSeeking}
                        setIsThumbnailStripVisible={setIsThumbnailStripVisible}
                    />}

                <VideoProgressBar
                    videoRef={videoRef}
                    virtualSeekTimeRef={virtualSeekTimeRef}
                    isFocusable={isProgressBarFocusable}
                    focusKey={VIDEO_PROGRESS_FOCUSKEY}
                    setIsSeeking={setIsSeeking} />
            </div>
        </FocusContext.Provider>
    );
}

export default VirtualThumbnailStripWithSeekBar