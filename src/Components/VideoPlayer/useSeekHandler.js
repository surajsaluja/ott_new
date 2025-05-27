// hooks/useSeekHandler.js
import { useRef, useEffect, useState, useCallback } from 'react';

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_ENTER = 13;
const KEY_BACK = 10009;
const KEY_ESC = 8;

export default function useSeekHandler(
    videoRef, 
    seekInterval = 10, 
    setIsSeeking,
    handlePlayPause, 
    handleBackPress, 
    handleFocusSeekBar,
    sideBarOpenRef, 
    userActivityRef,
    resetInactivityTimeout, 
    isSeekbarVisible,
    isThumbnailStripVisibleRef,
    setIsUserActive,
    isSeekingRef,
    handleFocusVideoOverlay,
    showSkipButtonsRef
) {
    const seekMultiplierRef = useRef(1);
    const seekIntervalRef = useRef(null);
    const directionRef = useRef(null);
    const seekHoldTimeout = useRef(null);
    const [seekDirection, setSeekDirection] = useState(null);
    const [seekMultiplier, setSeekMultiplier] = useState(0);

    const clearSeek = () => {
        clearInterval(seekIntervalRef.current);
        seekIntervalRef.current = null;

        // Reset multiplier after short delay
        clearTimeout(seekHoldTimeout.current);
        seekHoldTimeout.current = setTimeout(() => {
            setIsSeeking(false);
            seekMultiplierRef.current = 1;
            setSeekDirection(null);
            setSeekMultiplier(1);
        }, 1000);
    };

    const seek = useCallback((dir) => {
        const video = videoRef.current;
        if (!video) return;

        const delta = dir === "forward" ? seekInterval * seekMultiplierRef.current : -seekInterval * seekMultiplierRef.current;
        const newTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
        video.currentTime = newTime;

        setIsSeeking(true);
    }, [seekInterval, videoRef]);


    const handleKeyDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(e.keyCode == KEY_BACK || e.keyCode == KEY_ESC){
            if(e.repeat) return;
            handleBackPress();
        } else if (sideBarOpenRef.current || isThumbnailStripVisibleRef.current || isSeekingRef.current || showSkipButtonsRef.current) return;

        if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
            if(userActivityRef.current){
                resetInactivityTimeout();
                return;
            }
             const direction = e.keyCode === KEY_RIGHT ? 'forward' : 'backward';
            directionRef.current = direction;
            setSeekDirection(directionRef.current);

            if (!seekIntervalRef.current) {
                // Initial seek
                seek(direction);
                // Start interval
                seekIntervalRef.current = setInterval(() => {
                    seekMultiplierRef.current += 1;
                    setSeekMultiplier(seekMultiplierRef.current);
                    if(seekMultiplierRef.current > 3){
                        clearSeek();
                        return;
                    }
                    seek(directionRef.current);
                }, 500); // Adjust interval for desired speed
            }
        
        }

        if (e.keyCode == KEY_ENTER && !userActivityRef.current) {
            if(e.repeat) return;
            handlePlayPause();
        }

        if(e.keyCode === KEY_DOWN && !userActivityRef.current){
            if(e.repeat) return;
            handleFocusSeekBar();
        }

        if(e.keyCode === KEY_UP && !userActivityRef.current){
            if(e.repeat) return;
            console.log(' key up pressed');
            handleFocusVideoOverlay();
        }
    };

    const handleKeyUp = (e) => {
        if (sideBarOpenRef.current || isThumbnailStripVisibleRef.current || isSeekbarVisible || showSkipButtonsRef.current) return;
        if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
            clearSeek();
            setSeekDirection(null);
        }

    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearSeek();
        };
    }, []);

    return {
        seekDirection,
        seekMultiplier,
    }
}
