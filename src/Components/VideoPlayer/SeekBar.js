import React, { useEffect, useRef, useState } from "react";
import { useFocusable, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import './SeekBar.css'

const SeekBar = ({ videoRef, focusKey: focusKeyParam }) => {
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const seekSeconds = 10;
  
  const { ref, focused } = useFocusable({
    focusKey: focusKeyParam,
    onEnterPress: () => { },
    onFocus: () => { },
    onArrowPress: (direction) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
    
      if (direction === 'left') {
        video.currentTime = Math.max(0, video.currentTime - seekSeconds);
      } else if (direction === 'right') {
        video.currentTime = Math.min(video.duration, video.currentTime + seekSeconds);
      }
    
      // Immediately update the UI
      const newTime = video.currentTime;
      setProgress((newTime / video.duration) * 100);
      setCurrentTime(formatTime(newTime));
    },    
    onArrowRelease: (direction)=>{console.log(`release : ${direction}`)},
    trackChildren: true,
    saveLastFocusedChild: true,
    isFocusBoundary: true,
    focusBoundaryDirections:['left','right']
  });

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    let formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    return formattedTime;
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

    if(video)
    {
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("progress", updateBuffered);
    }

    return () => {
      if(window)
      {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("progress", updateBuffered);
      }
    };
  }, [videoRef.current]);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (e.nativeEvent.offsetX / e.target.clientWidth) * video.duration;
    video.currentTime = newTime;
  };

  return (
    <div ref={ref} className="seekbar-wrapper">
      <span className="time">{currentTime}</span>
      <div
        className="seekbar-container"
        onClick={handleSeek}
      >
        {/* Buffered progress */}
        <div className="buffered" style={{ width: `${buffered}%` }}></div>
        {/* Play progress */}
        <div className="progress" style={{ width: `${progress}%` }}></div>
        {/* Progress circle (draggable) */}
        {focused && (<div
          className="progress-circle"
          style={{ left: `${progress}%` }}
        ></div>)}
      </div>
      <span className="time">{videoRef.current ? formatTime(videoRef.current.duration) : ''}</span>
    </div>
  );
};

export default SeekBar;
