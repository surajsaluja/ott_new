// hooks/useSeekHandler.js
import { useRef, useEffect, useState, useCallback } from "react";

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
  isSeekbarVisible,
  isThumbnailStripVisibleRef,
  handleSetIsUserActive,
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
      // setIsSeeking(false);
      seekMultiplierRef.current = 1;
      setSeekDirection(null);
      setSeekMultiplier(1);
      console.log("Seeking Cleared");
    }, 1000);
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

  const handleKeyDown = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const isSidebarOpen = sideBarOpenRef.current === true;
    const isThumbnailStripVisible = isThumbnailStripVisibleRef.current === true;
    const isShowSkipButtons = showSkipButtonsRef.current === true;
    const isSeeking = isSeekingRef.current === true;
    

    if (isThumbnailStripVisibleRef.current) return;
 
    if(userActivityRef.current){
        handleSetIsUserActive(true);
        return false;
    }else if (
      isSidebarOpen ||
      isSeeking ||
      isShowSkipButtons
    )
      return;

    if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
      console.log("on KeyDown", {
        sideBarOpenRef: isSidebarOpen,
        isThumbnailStripVisibleRef: isThumbnailStripVisible,
        isSeekbarVisible,
        isSeeking,
        showSkipButtonsRef: isShowSkipButtons,
      });
      const direction = e.keyCode === KEY_RIGHT ? "forward" : "backward";
      directionRef.current = direction;
      setSeekDirection(directionRef.current);

      if (!seekIntervalRef.current) {
        // Initial seek
        seek(direction);
        // Start interval
        seekIntervalRef.current = setInterval(() => {
          seekMultiplierRef.current = Math.min(
            seekMultiplierRef.current + 1,
            4
          );
          setSeekMultiplier(seekMultiplierRef.current);
          if (seekMultiplierRef.current > 3) {
            // clearSeek();
            return;
          }
          seek(directionRef.current);
        }, 500); // Adjust interval for desired speed
      }
    }

    if (e.keyCode == KEY_ENTER && !userActivityRef.current) {
      console.log("enter pressed");
      if (e.repeat) return;
      handlePlayPause();
    }

    if (e.keyCode === KEY_DOWN || e.keyCode === KEY_UP) {
      if (e.repeat) return;
      handleFocusSeekBar();
    }
  };

  const handleKeyUp = (e) => {
    const isSidebarOpen = sideBarOpenRef.current === true;
    const isThumbnailStripVisible = isThumbnailStripVisibleRef.current === true;
    const isShowSkipButtons = showSkipButtonsRef.current === true;
    const isUserActive = userActivityRef.current === true;

    console.log({
      sideBarOpenRef: isSidebarOpen,
      isThumbnailStripVisibleRef: isThumbnailStripVisible,
      isSeekbarVisible,
      showSkipButtonsRef: isShowSkipButtons,
    });

    if (
      isSidebarOpen ||
      isThumbnailStripVisible ||
      isSeekbarVisible ||
      isShowSkipButtons ||
      isUserActive
    )
      return;

    if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
      clearSeek();
      setIsSeeking(false);
      setSeekDirection(null);
      return;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearSeek();
    };
  }, []);

  return {
    seekDirection,
    seekMultiplier,
    clearSeek,
  };
}
