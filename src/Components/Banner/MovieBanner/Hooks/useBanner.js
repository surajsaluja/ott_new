import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserContext } from "../../../../Context/userContext";
import { showModal } from "../../../../Utils";
import Hls from "hls.js";
import { useHistory } from "react-router-dom";

const TRAILER_PLAY_DELAY = 2000;

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

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!asset?.trailerUrl || !videoElement) {
      return;
    }

    const onVideoEnd = ()=>{
      
    }

    const playTrailer = () => {
      if (!videoElement) return;


      let hls;
      const onLoadedData = () => {
        setIsVideoLoaded(true);
        videoElement.play().catch(error => {
          console.error("Autoplay prevented:", error);
        });
        setIsPlaying(true);
      };

      videoElement.pause();
      videoElement.src = "";
      setIsVideoLoaded(false);

      videoElement.addEventListener("loadeddata", onLoadedData);
      videoElement.addEventListener("ended",onVideoEnd)

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

    const delayPlay = setTimeout(playTrailer, TRAILER_PLAY_DELAY);
    return () => clearTimeout(delayPlay);

  }, [asset?.trailerUrl, videoElement]);

  useEffect(() => {
    if (videoElement) {
      const resetVideo = () => {
        videoElement.pause();
        videoElement.currentTime = 0;
        setIsPlaying(false);
        setIsVideoLoaded(false);
      };

      if (asset) {
        resetVideo();
      }

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

  const watchMediaVOD = (isTrailer) => {
    if (isLoggedIn && userObjectId) {
      // get media Details and play that item
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
    showOverlay,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef
  };
};

export default useBanner;