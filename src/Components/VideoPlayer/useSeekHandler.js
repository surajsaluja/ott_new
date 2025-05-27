// hooks/useSeekHandler.js
import { useRef, useEffect, useState } from 'react';

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
    // const [isSeeking, setIsSeeking] = useState(false);
    const [seekDirection, setSeekDirection] = useState(null);
    const [seekMultiplier, setSeekMultiplier] = useState(0);

    const seekTimer = useRef(null);
    const longPressInterval = useRef(null);
    const longPressTriggered = useRef(false);
    const directionRef = useRef(null);
    const seekMultiplierRef = useRef(1);
    const seekHoldTimeout = useRef(null);

    const LONG_PRESS_DELAY = 300; // ms before long press starts
    const LONG_PRESS_REPEAT = 500; // ms between repeat seeks

    const clearTimers = () => {
        clearTimeout(seekTimer.current);
        clearInterval(longPressInterval.current);
        clearTimeout(seekHoldTimeout.current);
        seekTimer.current = null;
        longPressInterval.current = null;
        seekHoldTimeout.current = null;
        longPressTriggered.current = false;
        directionRef.current = null;
        setSeekDirection(null);
        setSeekMultiplier(0);
    };


    const performSeek = (direction, isHold) => {
        const video = videoRef.current;
        if (!video) return;

        const seekBy = seekInterval * seekMultiplierRef.current;
        const delta = direction === 'forward' ? seekBy : -seekBy;
        const newTime = Math.max(0, Math.min(isNaN(video.duration) ? 0 : video.duration, video.currentTime + delta));

        if (isHold) {
            setSeekMultiplier(prev => {
                const next = prev + 1;
                clearTimeout(seekHoldTimeout.current);
                seekHoldTimeout.current = setTimeout(() => {
                    setSeekMultiplier(1);
                }, 1000);
                return next;
            });
        } else {
            setSeekMultiplier(1);
        }

        video.currentTime = newTime;
        setIsSeeking(true);
    };

    const handleKeyDown = (e) => {
        if(e.repeat)
            return;
        e.preventDefault();
        e.stopPropagation();
        if(e.keyCode == KEY_BACK || e.keyCode == KEY_ESC){
            handleBackPress();
        } else if (sideBarOpenRef.current || isThumbnailStripVisibleRef.current || isSeekbarVisible || showSkipButtonsRef.current) return;

        if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
            if(userActivityRef.current){
                resetInactivityTimeout();
                return;
            }
            const direction = e.keyCode === KEY_RIGHT ? 'forward' : 'backward';
            setSeekDirection(direction);
            directionRef.current = direction;

            // Start long-press detection
            seekTimer.current = setTimeout(() => {
                longPressTriggered.current = true;
                performSeek(direction, false);

                longPressInterval.current = setInterval(() => {
                    performSeek(direction, true);
                }, LONG_PRESS_REPEAT);
            }, LONG_PRESS_DELAY);
            setIsSeeking(true);
        }

        if (e.keyCode == KEY_ENTER && !userActivityRef.current) {
            handlePlayPause();
        }

        if(e.keyCode === KEY_DOWN && !userActivityRef){
            handleFocusSeekBar();
        }

        if(e.keyCode === KEY_UP && !userActivityRef.current){
            console.log(' key up pressed');
            handleFocusVideoOverlay();
        }
    };

    const handleKeyUp = (e) => {
        if (sideBarOpenRef.current || isThumbnailStripVisibleRef.current || isSeekbarVisible || showSkipButtonsRef.current) return;
        
        if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
            const direction = directionRef.current;

            if (!longPressTriggered.current && direction) {
                performSeek(direction, false); // Short press
            }

            if(isSeekingRef.current){

        setIsSeeking(false);
            }

            clearTimers();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearTimers();
        };
    }, []);

    return {
        seekDirection,
        seekMultiplier,
    }
}
