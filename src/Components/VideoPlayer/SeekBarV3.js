import React, { useEffect, useRef, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import "./SeekBar.css";

const SeekBar = ({ videoRef, focusKey: focusKeyParam }) => {
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const seekSpeed = 10; // Seconds per seek interval
  const seekInterval = 10; // Milliseconds
  const isSeekingRef = useRef(false);
  const seekIntervalRef = useRef(null);

  const { ref, focused } = useFocusable({
    focusKey: focusKeyParam,
    onEnterPress: () => {},
    onFocus: () => {},
    trackChildren: true,
    saveLastFocusedChild: true,
    isFocusBoundary: true,
    onArrowPress: (direction) => handleKeyDown(direction),
    onArrowRelease: (direction) => handleKeyUp(direction),
    focusBoundaryDirections: ["down", "up"],
  });

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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
      stopSeeking(); // Ensure interval stops on unmount
    };
  }, [videoRef]);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime =
      (e.nativeEvent.offsetX / e.target.clientWidth) * video.duration;
    video.currentTime = newTime;
  };

  const handleKeyDown = (dir) => {
    const video = videoRef.current;
    if (!video || isSeekingRef.current) return;

    if (dir === "left" || dir === "right") {
      isSeekingRef.current = true;
      const direction = dir === "right" ? 1 : -1;

      // Apply initial seek
      video.currentTime = Math.max(
        0,
        Math.min(video.duration, video.currentTime + direction * seekSpeed)
      );

      // Start long-press seek
      seekIntervalRef.current = setInterval(() => {
        video.currentTime = Math.max(
          0,
          Math.min(video.duration, video.currentTime + direction * seekSpeed)
        );
      }, seekInterval);
    }
  };

  const handleKeyUp = (dir) => {
    if (dir === "left" || dir === "right") {
      stopSeeking();
    }
  };

  const stopSeeking = () => {
    debugger;
    if (seekIntervalRef.current) {
      clearInterval(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }
    isSeekingRef.current = false;
  };

  return (
    <div ref={ref} className="seekbar-wrapper">
      <span className="time">{currentTime}</span>
      <div className="seekbar-container" onClick={handleSeek}>
        {/* Buffered progress */}
        <div className="buffered" style={{ width: `${buffered}%` }}></div>
        {/* Play progress */}
        <div className="progress" style={{ width: `${progress}%` }}></div>
        {/* Progress circle (draggable) */}
        {focused && (
          <div className="progress-circle" style={{ left: `${progress}%` }}></div>
        )}
      </div>
      <span className="time">
        {videoRef.current ? formatTime(videoRef.current.duration) : ""}
      </span>
    </div>
  );
};

export default SeekBar;
