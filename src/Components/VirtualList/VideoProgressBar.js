import { useState, useEffect } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import './virtualList.css';

const SEEK_INTERVAL = 10;

const VideoProgressBar = ({
    videoRef,
    virtualSeekTimeRef,
    isFocusable = true,
    focusKey,
    setIsSeeking,
    setIsThumbnailStripVisible,
    hasThumbnails
}) => {
    const [progress, setProgress] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const [buffered, setBuffered] = useState(0);

    const { ref, focused } = useFocusable({
        focusKey,
        focusable: isFocusable,
        onArrowPress: (direction) => {
            if (direction === 'left' || direction === 'right') {
                if (hasThumbnails) {
                    setIsThumbnailStripVisible(true);
                } else {
                    seek(direction);
                }
            }
        }
    });

    const seek = (dir) => {
        const video = videoRef.current;
        if (!video || !focused) return;

        const delta = dir === "left" ? -SEEK_INTERVAL : SEEK_INTERVAL;
        const newTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
        video.currentTime = newTime;
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            const virtualTime = virtualSeekTimeRef.current;
            const currentTime = virtualTime != null ? virtualTime : video.currentTime;
            const duration = video.duration || 1;
            setProgress((currentTime / duration) * 100);
            setDisplayTime(currentTime);
        };

        const updateBuffered = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration || 1;
                setBuffered((bufferedEnd / duration) * 100);
            }
        };

        const interval = setInterval(updateProgress, 100);
        video.addEventListener("progress", updateBuffered);

        return () => {
            clearInterval(interval);
            video.removeEventListener("progress", updateBuffered);
        };
    }, [videoRef, virtualSeekTimeRef]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00:00";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return [hrs, mins, secs].map(unit => String(unit).padStart(2, '0')).join(':');
    };

    return (
        <div ref={ref} className="seekbar-wrapper">
            <span className="time">{formatTime(displayTime)}</span>
            <div className="seekbar-container">
                <div className="buffered" style={{ width: `${buffered}%` }} />
                <div className="progress" style={{ width: `${progress}%` }} />
                {focused && (
                    <div className="progress-circle focused" style={{ left: `${progress}%` }} />
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

export default VideoProgressBar;