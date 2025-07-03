import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserContext } from "../../../../Context/userContext";
import { getCategoryIdByCategoryName, showModal } from "../../../../Utils";
import Hls from "hls.js";
import { useHistory } from "react-router-dom";
import { getMediaDetailWithTokenisedMedia } from "../../../../Utils/MediaDetails";

const TRAILER_PLAY_DELAY = 1000;

const useBanner = (asset, banners) => {
  const [videoElement, setVideoElement] = useState(null);
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

  const handlePlayerVisibilityChange = () => {
    console.log(document.hidden);
    if (document.hidden) {
      videoElement.pause();
      setIsPlaying(false);
      console.log('video paused');
    } else {
      videoElement.play();
      setIsPlaying(true);
      console.log('video played');
    }
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

      videoElement.addEventListener("waiting", () => { });
      videoElement.addEventListener("canplay", handleVideoCanPlay);
      videoElement.addEventListener("playing", handleVideoPlay);
      videoElement.addEventListener("ended", handleVideoEnd)
      videoElement.addEventListener("stalled", () => { });
      window.addEventListener('visibilitychange', handlePlayerVisibilityChange);

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
        videoElement.removeEventListener("stalled", () => { });
        window.removeEventListener('visibilitychange', handlePlayerVisibilityChange);
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

  const showMediaDetail = () => {
    if (isLoggedIn && userObjectId) {
      const categoryId = getCategoryIdByCategoryName(banners[0].subCategory);
      history.push(`/detail/${categoryId}/${banners[0].mediaID}`);

    } else {
      showModal('Login',
        'You are not logged in !!',
        [
          { label: 'Login', action: redirectToLogin, className: 'primary' }
        ]
      );
    }
  }

  const watchMediaVOD = async (isTrailer = false) => {
    if (isLoggedIn && userObjectId) {
      // get media Details and play that item
      const tokenisedResponse = await getMediaDetailWithTokenisedMedia(banners[0].mediaID, banners[0].subCategory, isTrailer);
      if (tokenisedResponse && tokenisedResponse.isSuccess) {
        history.push('/play', {
          src: tokenisedResponse.data.mediaUrl,
          thumbnailBaseUrl: isTrailer ? tokenisedResponse?.data?.mediaDetail?.trailerBasePath : tokenisedResponse?.data?.mediaDetail?.trickyPlayBasePath,
          title: tokenisedResponse?.data?.mediaDetail?.title,
          mediaId: banners[0].mediaID,
          onScreenInfo: tokenisedResponse?.data?.onScreenInfo,
          skipInfo: tokenisedResponse?.data?.skipInfo,
          isTrailer: isTrailer,
          playDuration: 0
          // playDuration: isResume ? mediaDetail.playDuration : 0
        });
      } else {
        console.error(tokenisedResponse.message);
      }
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

  const handleImageLoaded = () => {
    setIsImageLaoded(true);
  }

  return {
    showBanner,
    videoRef,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef,
    handleImageLoaded,
    isImageLoaded,
    showMediaDetail
  };
};

export default useBanner;