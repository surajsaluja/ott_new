// hooks/useSeekHandler.js
import { useRef, useEffect, useState, useCallback } from "react";

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_ENTER = 13;
const KEY_BACK = 10009;
const KEY_ESC = 8;
const KEY_YELLOW_INFO = 405;
const KEY_INFO= 457;
const MULTIPLIER_RESET_DELAY = 1000; // threshold to maintain multiplier
const SEEK_MULTIPLIER_CHANGE_TIME = 500; // time to increase seek multiplier on hold

export default function useSeekHandler(
  videoRef,
  seekInterval = 10,
  setIsSeeking,
  handlePlayPause,
  handleBackPress,
  handleFocusSeekBar,
  sideBarOpenRef,
  userActivityRef,
  isSeekbarVisible,
  isThumbnailStripVisibleRef,
  handleSetIsUserActive,
  isSeekingRef,
  handleFocusVideoOverlay,
  showSkipButtonsRef,
  streamLimitErrorRef
) {
  const seekMultiplierRef = useRef(1);
  const seekIntervalRef = useRef(null);
  const directionRef = useRef(null);
  const multiplierResetTimeout = useRef(null);
  const lastKeyPressTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const lastDirectionRef = useRef(null);
  const [seekDirection, setSeekDirection] = useState(null);
  const [seekMultiplier, setSeekMultiplier] = useState(1);

  const clearSeek = () => {
    clearInterval(seekIntervalRef.current);
    seekIntervalRef.current = null;
    isHoldingRef.current = false;
  };

  const resetMultiplier = () => {
    seekMultiplierRef.current = 1;
    setSeekMultiplier(1);
    setSeekDirection(null);
    lastDirectionRef.current = null;
  };

  const increaseMultiplier = () => {
    seekMultiplierRef.current = Math.min(seekMultiplierRef.current + 1, 4);
    setSeekMultiplier(seekMultiplierRef.current);
  };

  const seek = useCallback(
    (dir) => {
      const video = videoRef.current;
      if (!video) return;

      const delta =
        dir === "forward"
          ? seekInterval * seekMultiplierRef.current
          : -seekInterval * seekMultiplierRef.current;
      const newTime = Math.max(
        0,
        Math.min(video.duration, video.currentTime + delta)
      );
      video.currentTime = newTime;

      setIsSeeking(true);
    },
    [seekInterval, videoRef]
  );

  const startSeekInterval = (direction) => {
    if (seekIntervalRef.current) return;
    
    // Initial seek
    seek(direction);
    
    // Start interval for increasing multiplier while holding
    seekIntervalRef.current = setInterval(() => {
      isHoldingRef.current = true;
      increaseMultiplier();
      if (seekMultiplierRef.current > 4) {
            resetMultiplier();
            clearSeek();
            return;
          }
      seek(direction);
    }, SEEK_MULTIPLIER_CHANGE_TIME);
  };

  const handleKeyDown = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const isSidebarOpen = sideBarOpenRef.current === true;
  const isThumbnailStripVisible = isThumbnailStripVisibleRef.current === true;
  const isSeeking = isSeekingRef.current === true;

  if (isThumbnailStripVisible || streamLimitErrorRef.current) return;

  if (userActivityRef.current) {
    handleSetIsUserActive(true);
    return false;
  } else if (isSidebarOpen || isSeeking) return;

  if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
    // const now = Date.now();
    // const direction = e.keyCode === KEY_RIGHT ? "forward" : "backward";

    // // Reset everything if direction changes
    // if (lastDirectionRef.current && lastDirectionRef.current !== direction) {
    //   clearSeek();
    //   resetMultiplier();
    //   clearTimeout(multiplierResetTimeout.current);
    // }

    // if (now - lastKeyPressTimeRef.current < MULTIPLIER_RESET_DELAY &&
    //     direction === lastDirectionRef.current && 
    //     !isHoldingRef.current) {
    //   increaseMultiplier();
    // }

    // // Update direction references
    // lastDirectionRef.current = direction;
    // directionRef.current = direction;
    // setSeekDirection(direction);
    // lastKeyPressTimeRef.current = now;

    // // Start seeking
    // startSeekInterval(direction);
    handleFocusSeekBar();
  }

  if (e.keyCode === KEY_ENTER && !userActivityRef.current) {
    if (e.repeat) return;
    handlePlayPause();
  }

  if (e.keyCode === KEY_DOWN || e.keyCode === KEY_UP || e.keyCode === KEY_INFO || e.keyCode === KEY_YELLOW_INFO) {
    if (e.repeat) return;
    handleFocusSeekBar();
  }
};

const handleKeyUp = (e) => {
  const isSidebarOpen = sideBarOpenRef.current === true;
  const isThumbnailStripVisible = isThumbnailStripVisibleRef.current === true;
  const isShowSkipButtons = showSkipButtonsRef.current === true;
  const isUserActive = userActivityRef.current === true;

  if (isSidebarOpen || isThumbnailStripVisible || 
      isSeekbarVisible || isShowSkipButtons || isUserActive) {
    return;
  }

  if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
    clearSeek();
    setIsSeeking(false);
    
    // Schedule multiplier reset only if no new key is pressed
    clearTimeout(multiplierResetTimeout.current);
    multiplierResetTimeout.current = setTimeout(resetMultiplier, MULTIPLIER_RESET_DELAY);
  }
};
  

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearSeek();
      clearTimeout(multiplierResetTimeout.current);
    };
  }, []);

  return {
    seekDirection,
    seekMultiplier,
    clearSeek,
    resetMultiplier
  };
}