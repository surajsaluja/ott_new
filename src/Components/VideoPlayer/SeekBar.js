import React, { useEffect, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import "./SeekBar.css";

const SeekBar = ({ videoRef, resetInactivityTimeout, focusKey: focusKeyParam }) => {
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const seekSeconds = 10;
  const thumbnailInterval = 10; // seconds
  const thumbnailBaseURL = "https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail"; // Replace with your actual URL

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00:00";
    const h = String(Math.floor(time / 3600)).padStart(2, "0");
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(time % 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const { ref, focused } = useFocusable({
    focusKey: focusKeyParam,
    onEnterPress: () => {},
    onFocus: () => {},
    onArrowPress: (direction) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;

      setIsSeeking(true); // show thumbnail

      if (!video || !video.duration) return;
    
      if (direction === 'left') {
        video.currentTime = Math.max(0, video.currentTime - seekSeconds);
      } else if (direction === 'right') {
        video.currentTime = Math.min(video.duration, video.currentTime + seekSeconds);
      }

      resetInactivityTimeout();
    
      // Immediately update the UI
      const newTime = video.currentTime;
      setProgress((newTime / video.duration) * 100);
      setCurrentTime(formatTime(newTime));
      resetInactivityTimeout();

      const rounded = Math.floor(newTime / thumbnailInterval);
      const padded = String(rounded).padStart(9, '0');
  // return `${padded}.jpg`;
      setThumbnailSrc(`${thumbnailBaseURL}${padded}.jpg`);
    },
    onArrowRelease: () => {
      setIsSeeking(false); // hide thumbnail
    },
    trackChildren: true,
    saveLastFocusedChild: true,
    isFocusBoundary: true,
    focusBoundaryDirections: ["left", "right"]
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(formatTime(video.currentTime));
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

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / e.target.clientWidth) * video.duration;

    video.currentTime = newTime;
    setProgress((newTime / video.duration) * 100);
    setCurrentTime(formatTime(newTime));
  };

  return (
    <div ref={ref} className="seekbar-wrapper">
      <span className="time">{currentTime}</span>
      <div className="seekbar-container" onClick={handleSeek}>
        <div className="buffered" style={{ width: `${buffered}%` }}></div>
        <div className="progress" style={{ width: `${progress}%` }}></div>
        {focused && (
          <div
            className={`progress-circle ${focused ? "focused" : ""}`}
            style={{ left: `${progress}%` }}
          >
          </div>
        )}
        {focused && isSeeking && thumbnailSrc && (
        <div className="thumbnail-preview"
        style={{ left: `calc(${progress}% - 80px)` }}
        >
          <img src={thumbnailSrc} alt="Preview" />
          <span>{currentTime}</span>
        </div>
        
      )}
      </div>
      <span className="time">
        {videoRef.current?.duration ? formatTime(videoRef.current.duration) : "00:00:00"}
      </span>
    </div>
  );
};

export default SeekBar;
