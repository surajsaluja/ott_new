import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserContext } from "../../../Context/userContext";
import useMedia from '../../../Hooks/useMedia';
import { showModal } from "../../../Utils";
import Hls from "hls.js";
import { useHistory } from "react-router-dom";


const useBanner = (asset, banners) => {
  const [videoElement, setVideoElement] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { userObjectId, uid, isLoggedIn } = useUserContext();
  const history = useHistory();
  const videoPlayerRef = useRef(null);
  const hlsRef = useRef(null);

  const { getMediaDetails } = useMedia();

  const formatTime = (time) => {
    const [h = 0, m = 0, s = 0] = time?.split(":").map(Number);
    const styles = {
      grey: { color: "grey" },
      white: { color: "white" },
    };
    const pad = (num) => String(num).padStart(2, "0");

    return (
      <label>
        <label style={h > 0 ? styles.white : styles.grey}>{pad(h)}:</label>
        <label style={h > 0 || m > 0 ? styles.white : styles.grey}>{pad(m)}:</label>
        <label style={h > 0 || m > 0 || s > 0 ? styles.white : styles.grey}>{pad(s)}</label>
      </label>
    );
  };

  const videoRef = useCallback((node) => {
    if (node !== null) {
      setVideoElement(node);
      videoPlayerRef.current = node;
    }
  }, []);

  useEffect(() => {
    setShowBanner(asset == null);
    setIsVideoLoaded(false);
    setIsPlaying(false);

    // Cleanup any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!asset?.trailerUrl || !videoElement) {
      return;
    }

    const playTrailer = () => {
      if (!videoElement) return;

      let hls;
      const onLoadedData = () => {
        setIsVideoLoaded(true);
        videoElement.play().catch(error => {
          console.error("Autoplay prevented:", error);
          // Optionally show a play button
        });
        setIsPlaying(true);
      };

      videoElement.pause();
      videoElement.src = "";
      setIsVideoLoaded(false);

      videoElement.addEventListener("loadeddata", onLoadedData);

      if (Hls.isSupported()) {
        hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(asset.trailerUrl);
        hls.attachMedia(videoElement);
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = asset.trailerUrl;
      }

      return () => {
        videoElement.removeEventListener("loadeddata", onLoadedData);
        if (hls) hls.destroy();
        setIsPlaying(false);
      };
    };

    // Debounce the trailer loading slightly to avoid rapid reloads on quick focus changes
    const delayPlay = setTimeout(playTrailer, 300);
    return () => clearTimeout(delayPlay);

  }, [asset?.trailerUrl, videoElement]);

  // Effect to reset video to poster on asset change or component unmount
  useEffect(() => {
    if (videoElement) {
      const resetVideo = () => {
        videoElement.pause();
        videoElement.currentTime = 0;
        setIsPlaying(false);
        setIsVideoLoaded(false);
      };

      // Reset when the asset changes
      if (asset) {
        resetVideo();
      }

      // Cleanup on unmount
      return () => {
        resetVideo();
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
  }, [asset, videoElement]);


  const redirectToLogin = () => {
    history.replace('/login', { from: '/' });
  };

  const watchMediaVOD = () => {
    if (isLoggedIn && userObjectId) {
      getMediaDetails(asset.mediaID, userObjectId, asset.category);
    }
    else {
      showModal('Login',
        'You are not logged in !!',
        [
          { label: 'Login', action: redirectToLogin, className: 'primary' }
        ]
      );
    }
  };

  return {
    showBanner,
    videoRef,
    formatTime,
    showOverlay,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef
  };
};

export default useBanner;