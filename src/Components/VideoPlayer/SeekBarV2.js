import React, { useEffect, useRef, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import "./SeekBar.css";

const SeekBar = ({ videoRef, focusKey: focusKeyParam }) => {
    const [progress, setProgress] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [currentTime, setCurrentTime] = useState("00:00");

    const { ref, focused } = useFocusable({
        focusKey: focusKeyParam,
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
        };
    }, [videoRef]);

    return (
        <div ref={ref} className="seekbar-wrapper">
            <span className="time">{currentTime}</span>
            <div className="seekbar-container">
                <div className="buffered" style={{ width: `${buffered}%` }}></div>
                <div className="progress" style={{ width: `${progress}%` }}></div>
                {focused && (
                    <div className="progress-circle" style={{ left: `${progress}%` }}></div>
                )}
            </div>
            <span className="time">{videoRef.current ? formatTime(videoRef.current.duration) : ""}</span>
        </div>
    );
};

export default SeekBar;
