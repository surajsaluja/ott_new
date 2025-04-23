import React, { useState, useEffect, useCallback, use } from "react";
import { useUserContext } from "../../../Context/userContext";
import useMedia from '../../../Hooks/useMedia'
import { showModal } from "../../../Utils";
import Hls from "hls.js";
import { useHistory } from "react-router-dom";

const useBanner = (asset, banners) => {
  const [videoElement, setVideoElement] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const {userObjectId,uid,isLoggedIn} = useUserContext();
  const history = useHistory();

  const {getMediaDetails} = useMedia();

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
    }
  }, []);

  useEffect(() => {
    setShowBanner(asset == null);
  }, [asset]);

  useEffect(() => {
  const delayPlay = setTimeout(() => {
    if (!asset?.trailerUrl || !videoElement) return;

    let hls;
    const onLoadedData = () => videoElement.play();

    videoElement.pause();
    videoElement.src = "";

    videoElement.addEventListener("loadeddata", onLoadedData);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(asset.trailerUrl);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = asset.trailerUrl;
    }

    return () => {
      videoElement.removeEventListener("loadeddata", onLoadedData);
      if (hls) hls.destroy();
    };
  }, 400); // Debounce delay

  return () => clearTimeout(delayPlay);
}, [asset?.trailerUrl, videoElement]);


  const redirectToLogin = () =>{
    history.replace('/login',{from: '/'});
  }

  const watchMediaVOD = () =>{
    if(isLoggedIn && userObjectId){
      const mediaDetails =  getMediaDetails(asset.mediaID,userObjectId,asset.category);
    }
    else{
      showModal('Login',
        'You are not logged in !!',
        [
          {label: 'Login', action: redirectToLogin, className: 'primary'}
        ]
      )
    }
  }

  return {
    showBanner,
    videoRef,
    formatTime,
    showOverlay,
    watchMediaVOD
  };
};

export default useBanner;
