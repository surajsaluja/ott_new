import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserContext } from "../../../../Context/userContext";
import { showModal } from "../../../../Utils";
import Hls from "hls.js";
import { useHistory } from "react-router-dom";

const TRAILER_PLAY_DELAY = 1000;

const useBanner = (asset, banners) => {
  const [videoElement, setVideoElement] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isImageLoaded, setIsImageLaoded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { userObjectId, uid, isLoggedIn } = useUserContext();
  const history = useHistory();
  const videoPlayerRef = useRef(null);
  const hlsRef = useRef(null);

  const handleVideoCanPlay = () => {
    setIsVideoLoaded(true);
    videoElement.play().catch(error => {
      console.error("Autoplay prevented:", error);
    });
  }

  const handleVideoPlay = () => {
    setIsPlaying(true);
  }

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setIsVideoLoaded(false);
  }

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
      console.warn('trailer not avialable');
      return;
    }

    const playTrailer = () => {
      if (!videoElement) return;

      let hls;

      videoElement.pause();
      videoElement.src = "";
      setIsVideoLoaded(false);

      videoElement.addEventListener("waiting", () => {});
      videoElement.addEventListener("canplay", handleVideoCanPlay);
      videoElement.addEventListener("playing", handleVideoPlay);
      videoElement.addEventListener("ended", handleVideoEnd)
      videoElement.addEventListener("stalled", () => {});

      if (Hls.isSupported()) {
        hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(asset.trailerUrl);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
          if (videoElement.textTracks) {
            for (let i = 0; i < videoElement.textTracks.length; i++) {
              videoElement.textTracks[i].mode = "disabled";
            }
          }
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = asset.trailerUrl;
      }

      // Disable subtitles/text tracks
      // Disable all subtitles / text tracks
      if (videoElement.textTracks) {
        for (let i = 0; i < videoElement.textTracks.length; i++) {
          videoElement.textTracks[i].mode = "disabled";
        }
      }

      return () => {
        videoElement.removeEventListener("waiting", () => { });
        videoElement.removeEventListener("canplay", handleVideoCanPlay);
        videoElement.removeEventListener("playing", handleVideoPlay);
        videoElement.removeEventListener("ended", handleVideoEnd)
        videoElement.removeEventListener("stalled", () => {});
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

  const handleImageLoaded = ()=>{
      setIsImageLaoded(true);
    }

  return {
    showBanner,
    videoRef,
    showOverlay,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef,
    handleImageLoaded,
    isImageLoaded
  };
};

export default useBanner;