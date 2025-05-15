import React, { useCallback, useEffect, useState, useRef } from "react";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import "./SeekBar.css";
import VirtualizedThumbnailStrip from "../VirtualList/VirtualThumbnailStrip";

const SeekBar = ({ videoRef, resetInactivityTimeout, focusKey: focusKeyParam }) => {
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [seekTime, setSeekTime] = useState(null); // This is what user is previewing
  const [duration, setDuration] = useState(0);
  const [internalUpdate, setInternalUpdate] = useState(false);

  const thumbnailInterval = 10;
  const thumbnailBaseURL = "https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail";

  const { ref, focused, focusKey: currentFocusKey } = useFocusable({ focusKey: focusKeyParam });

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00:00";
    const h = String(Math.floor(time / 3600)).padStart(2, "0");
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(time % 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleThumbnailFocus = useCallback((index) => {
    const newSeekTime = index * thumbnailInterval;
    if (seekTime !== newSeekTime) {
      setSeekTime(newSeekTime);
      setInternalUpdate(true);
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [seekTime, videoRef]);

  useEffect(() => {
    if (internalUpdate) {
      setInternalUpdate(false);
    }
  }, [internalUpdate]);

  // Keep thumbnails in sync with currentTime (e.g., from video progress)

  useEffect(() => {
    if (!internalUpdate && typeof currentTime === 'number') {
      const newIndex = Math.floor(currentTime / thumbnailInterval);
      setSeekTime(newIndex * thumbnailInterval);
    }
  }, [currentTime, internalUpdate]);


  const handleEnter = useCallback(() => {
    if (videoRef.current && seekTime !== null) {
      videoRef.current.currentTime = seekTime;
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    }
  }, [seekTime, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(formatTime(video.currentTime));
      setDuration(video.duration);
    };

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("progress", updateBuffered);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("progress", updateBuffered);
    };
  }, [videoRef]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="seekbar-wrapper">
        <span className="time">{seekTime ? formatTime(seekTime) : currentTime}</span>
        <div className="seekbar-container">
          <div className="buffered" style={{ width: `${buffered}%` }}></div>
          <div className="progress" style={{ width: `${progress}%` }}></div>
          {focused && (
            <div className="progress-circle focused" style={{ left: `${progress}%` }}></div>
          )}
          <div className="thumb-wrapper">
            <VirtualizedThumbnailStrip
              thumbnailBaseUrl={thumbnailBaseURL}
              seekTime={seekTime}
              totalThumbnails={duration ? Math.floor(duration / thumbnailInterval) : 0}
              onThumbnailFocus={handleThumbnailFocus}
              onEnter={handleEnter}
            />
          </div>
        </div>
        <span className="time">{formatTime(duration)}</span>
      </div>
    </FocusContext.Provider>
  );
};

export default SeekBar;