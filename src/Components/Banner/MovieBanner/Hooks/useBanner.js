import { useState, useEffect, useCallback, useRef } from "react";
import Hls from "hls.js";
import { useUserContext } from "../../../../Context/userContext";
import { useHistory } from "react-router-dom";
import { getCategoryIdByCategoryName, showModal } from "../../../../Utils";
import { getMediaDetailWithTokenisedMedia } from "../../../../Utils/MediaDetails";

const TRAILER_PLAY_DELAY = 1000;

const useBanner = (asset,banners) => {

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEl, setVideoEl] = useState(null);

  const hlsRef = useRef(null);
  const videoRef = useCallback(node => {
    if (node) setVideoEl(node);
  }, []);

  const { userObjectId, isLoggedIn } = useUserContext();
  const history = useHistory();

  // Video playback logic
  useEffect(() => {
  if (!asset?.trailerUrl || !videoEl) return;

  const el = videoEl;
  let hls;

  const onCanPlay = () => {
    setIsVideoLoaded(true);
    el.play().catch(err => console.warn("Autoplay failed:", err));
  };
  const onPlay = () => setIsPlaying(true);
  const onEnded = () => {
    setIsPlaying(false);
    setIsVideoLoaded(false);
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const playTrailer = () => {
    el.pause();
    el.src = "";
    setIsVideoLoaded(false);

    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("playing", onPlay);
    el.addEventListener("ended", onEnded);
    window.addEventListener("visibilitychange", onVisibilityChange);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(asset.trailerUrl);
      hls.attachMedia(el);
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        Array.from(el.textTracks).forEach(track => (track.mode = "disabled"));
      });
      hlsRef.current = hls;
    } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = asset.trailerUrl;
    }
  };

  const timer = setTimeout(playTrailer, TRAILER_PLAY_DELAY);

  return () => {
    clearTimeout(timer);
    el.removeEventListener("canplay", onCanPlay);
    el.removeEventListener("playing", onPlay);
    el.removeEventListener("ended", onEnded);
    window.removeEventListener("visibilitychange", onVisibilityChange);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };
}, [asset?.mediaID, videoEl]);

  // Cleanup on asset change
  useEffect(() => {
    if (!videoEl) return;
    videoEl.pause();
    videoEl.currentTime = 0;
    setIsPlaying(false);
    setIsVideoLoaded(false);
  }, [asset, videoEl]);

  const redirectToLogin = () => history.push('/login', { from: '/' });

  const showMediaDetail = () => {
    if (isLoggedIn && userObjectId) {
      const categoryId = getCategoryIdByCategoryName(banners[0].subCategory);
      history.push(`/detail/${categoryId}/${banners[0].mediaID}`);
    } else {
      showModal("Login", "You are not logged in !!", [
        { label: "Login", action: redirectToLogin, className: "primary" }
      ]);
    }
  };

  const watchMediaVOD = async (isTrailer = false) => {
    if (isLoggedIn && userObjectId) {
      const res = await getMediaDetailWithTokenisedMedia(
        banners[0].mediaID,
        banners[0].categoryId,
        isTrailer
      );
      if (res?.isSuccess) {
        history.push("/play", {
          src: res.data.mediaUrl,
          thumbnailBaseUrl: isTrailer
            ? res.data.mediaDetail?.trailerBasePath
            : res.data.mediaDetail?.trickyPlayBasePath,
          title: res.data.mediaDetail?.title,
          mediaId: banners[0].mediaID,
          onScreenInfo: res.data.onScreenInfo,
          skipInfo: res.data.skipInfo,
          isTrailer,
          playDuration: res.data.mediaDetail?.playDuration,
          nextEpisodeMediaId: res?.data?.currentEpisode?.nextEpisodeMediaId || null
        });
      } else {
        console.error(res.message);
        if(res.message != 'No Internet Connection'){
        showModal("Warning",res.message,[]);
        }
      }
    } else {
      showModal("Login", "You are not logged in !!", [
        { label: "Login", action: redirectToLogin, className: "primary" }
      ]);
    }
  };

  return {
    videoRef,
    isVideoLoaded,
    isPlaying,
    handleImageLoaded: () => setIsImageLoaded(true),
    isImageLoaded,
    watchMediaVOD,
    showMediaDetail,
    showBanner: asset == null
  };
};

export default useBanner;
