import { useRef, useState } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import VirtualizedThumbnailStrip from "./VirtualizedThumbnailStrip";
import VideoProgressBar from "./VideoProgressBar";
import './virtualList.css';

const THUMBNAIL_STRIP_FOCUSKEY = 'STRIP_THUMBNAIL';
const VIDEO_PROGRESS_FOCUSKEY = 'PROGRESS_VIDEO';

const VirtualThumbnailStripWithSeekBar = ({ videoRef, thumbnailBaseUrl, onClose, focusKey }) => {
    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey,
        trackChildren: false,
    saveLastFocusedChild: false,
        onFocus: () => {  
        }
    });
    const virtualSeekTimeRef = useRef(null);
    const [isProgressBarFocusable, setIsProgressBarFocusable] = useState(true);
    return (
        <FocusContext.Provider value={currentFocusKey}>
        <div ref={ref} className="thumbnails_strip" >
            <VirtualizedThumbnailStrip videoRef={videoRef} thumbnailBaseUrl={thumbnailBaseUrl} onClose={onClose} virtualSeekTimeRef={virtualSeekTimeRef} focusKey={THUMBNAIL_STRIP_FOCUSKEY} />
            <VideoProgressBar videoRef={videoRef} virtualSeekTimeRef={virtualSeekTimeRef} isFocusable={isProgressBarFocusable} focusKey={VIDEO_PROGRESS_FOCUSKEY} />
        </div>
        </FocusContext.Provider>
    );
}

export default VirtualThumbnailStripWithSeekBar