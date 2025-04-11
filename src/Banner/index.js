import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './index.css';

const Banner = ({ data: asset = null, banners = [] }) => {
  const videoRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    setShowBanner(!asset);
  }, [asset]);

  useEffect(() => {
    const video = videoRef.current;
    if (!asset?.trailerUrl || !video) return;

    let hls;

    const onLoadedData = () => video.play();
    const onPlaying = () => {};
    const onEnded = () => {};

    video.pause();
    video.src = '';

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(asset.trailerUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = asset.trailerUrl;
    }

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
      if (hls) hls.destroy();
    };
  }, [asset?.trailerUrl]);

  if (!asset && banners.length === 0) return null;

  const renderMedia = () => {
    if (showBanner && banners.length > 0) {
      return <img src={banners[0].fullPageBanner} className="banner-video" />;
    }

    if (asset?.trailerUrl) {
      return (
        <video
          ref={videoRef}
          className="banner-video"
          autoPlay
          poster={asset.fullPageBanner}
          playsInline
          muted
        />
      );
    }

    return <img src={asset?.fullPageBanner} className="banner-video" />;
  };

  return (
    <div className="top-banner">
      <div className="banner-video-container">
        {renderMedia()}
        {showOverlay && (
          <div className="banner-overlay">
            <div className="banner-gradient" />
            <div className="asset-info">
              {/* Optionally render logo/title/description */}
              <div className="asset-buttons">
                <button className="play-btn">▶ Play</button>
                <button className="info-btn">ℹ More Info</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
