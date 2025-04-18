import React, { useState, useEffect, useCallback } from "react";
import Hls from "hls.js";

const useBanner = (asset, banners) => {
  const [videoElement, setVideoElement] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  const formatTime = (time) => {
    const [h = 0, m = 0, s = 0] = time?.split(":").map(Number);
    const styles = {
      grey: { color: "grey" },
      white: { color: "white" },
    };
    const pad = (num) => String(num).padStart(2, "0");

    return (
      <span>
        <span style={h > 0 ? styles.white : styles.grey}>{pad(h)}:</span>
        <span style={h > 0 || m > 0 ? styles.white : styles.grey}>{pad(m)}:</span>
        <span style={h > 0 || m > 0 || s > 0 ? styles.white : styles.grey}>{pad(s)}</span>
      </span>
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
  }, [asset?.trailerUrl, videoElement]);

  return {
    showBanner,
    videoRef,
    formatTime,
    showOverlay,
  };
};

export default useBanner;
