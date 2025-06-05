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

  const handleVideoCanPlay = () => {
    console.log('can play');
    setIsVideoLoaded(true);
    videoElement.play().catch(error => {
      console.error("Autoplay prevented:", error);
    });
  }

  const handleVideoPlay = () => {
    console.log('playing');
    setIsPlaying(true);
  }

  const handleVideoEnd = () => {
    console.log('video ended');
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
      console.log('trailer not avialable');
      return;
    }

    const playTrailer = () => {
      if (!videoElement) return;

      let hls;

      videoElement.pause();
      videoElement.src = "";
      setIsVideoLoaded(false);

      videoElement.addEventListener("waiting", () => { console.log('waiting') });
      videoElement.addEventListener("canplay", handleVideoCanPlay);
      videoElement.addEventListener("playing", handleVideoPlay);
      videoElement.addEventListener("ended", handleVideoEnd)
      videoElement.addEventListener("stalled", () => { console.log('stalled') });

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
        videoElement.removeEventListener("waiting", () => { console.log('') });
        videoElement.removeEventListener("canplay", handleVideoCanPlay);
        videoElement.removeEventListener("playing", handleVideoPlay);
        videoElement.removeEventListener("ended", handleVideoEnd)
        videoElement.removeEventListener("stalled", () => { console.log('stalled') });
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