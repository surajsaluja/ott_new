import { useState, useEffect, useRef } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import './virtualList.css';

const VideoProgressBar = ({ videoRef, virtualSeekTimeRef, isFocusable = true, focusKey, setIsSeeking }) => {
    const [progress, setProgress] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const [buffered, setBuffered] = useState(0);

    const LONG_PRESS_THRESHOLD = 500;
const SEEK_INTERVAL = 10;
const CONTINUOUS_SEEK_INTERVAL = 200;

  const [position, setPosition] = useState(0);
  const timerRef = useRef(null);
  const longPressRef = useRef(false);
  const directionRef = useRef(null);
  const intervalRef = useRef(null);

    const { ref, focused } = useFocusable({
        focusKey,
        focusable: isFocusable,
    });

     const seek = (dir) => {
    const video = videoRef.current;
    if (!video || !focused) return;
    const delta = dir === "left" ? -SEEK_INTERVAL : SEEK_INTERVAL;
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    video.currentTime = newTime;
    setPosition(newTime);
  };

  const startSeek = (dir) => {
    if(!focused) return;
    setIsSeeking(true);
    longPressRef.current = false;
    directionRef.current = dir;

    timerRef.current = setTimeout(() => {
      longPressRef.current = true;
      intervalRef.current = setInterval(() => {
        seek(dir);
      }, CONTINUOUS_SEEK_INTERVAL);
    }, LONG_PRESS_THRESHOLD);
  };

  const stopSeek = () => {
    if(!focused) return;
    setIsSeeking(false);
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);

    if (!longPressRef.current && directionRef.current) {
      seek(directionRef.current);
    }

    directionRef.current = null;
    longPressRef.current = false;
  };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            const virtualTime = virtualSeekTimeRef.current;
            //const currentTime = virtualTime != null ? virtualTime : video.currentTime;
            const duration = video.duration || 1;
            const progressTime = virtualTime != null ? virtualTime : video.currentTime;
            setProgress((progressTime / duration) * 100);

            setDisplayTime(video.currentTime);
            //setProgress((currentTime / duration) * 100);
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
    }, [videoRef, virtualSeekTimeRef]);

    useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") startSeek("left");
      if (e.key === "ArrowRight") startSeek("right");
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        stopSeek();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [focused]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00:00";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return [hrs, mins, secs]
            .map(unit => String(unit).padStart(2, '0'))
            .join(':');
    };

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
export default VideoProgressBar