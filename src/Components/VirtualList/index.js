import { useRef, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import VirtualizedThumbnailStrip from "./VirtualizedThumbnailStrip";
import VideoProgressBar from "./VideoProgressBar";
import './virtualList.css';

const THUMBNAIL_STRIP_FOCUSKEY = 'STRIP_THUMBNAIL';
const VIDEO_PROGRESS_FOCUSKEY = 'PROGRESS_VIDEO';

const VirtualThumbnailStripWithSeekBar = ({ videoRef, thumbnailBaseUrl, onClose, focusKey }) => {
    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey,
        onFocus: () => {
            console.log('Focused Virtyal');
        }
    });
    const virtualSeekTimeRef = useRef(null);
    const [isProgressBarFocusable, setIsProgressBarFocusable] = useState(true);
    return (
        <div ref={ref} className="thumbnails_strip">
            <VirtualizedThumbnailStrip videoRef={videoRef} thumbnailBaseUrl={thumbnailBaseUrl} onClose={onClose} virtualSeekTimeRef={virtualSeekTimeRef} focusKey={THUMBNAIL_STRIP_FOCUSKEY} />
            <VideoProgressBar videoRef={videoRef} virtualSeekTimeRef={virtualSeekTimeRef} isFocusable={isProgressBarFocusable} focusKey={VIDEO_PROGRESS_FOCUSKEY} />
        </div>
    );
}

export default VirtualThumbnailStripWithSeekBar