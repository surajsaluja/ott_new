import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './index.css'; // For custom styles

const Banner = ({ data : asset }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (asset?.trailerUrl && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(asset.trailerUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
        return () => {
          hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = asset.trailerUrl;
        videoRef.current.play();
      }
    }
  }, [asset?.trailerUrl]);

  if (!asset) return null;

  return (
    <div className="top-banner">
      <div className="banner-video-container">
        <video
          ref={videoRef}
          className="banner-video"
          muted
          autoPlay
          playsInline
          loop
        />
        <div className="banner-overlay">
          <div className="asset-info">
            <img src={asset.imageUrl} alt={asset.title} className="asset-logo" />
            <h1 className="asset-title">{asset.title}</h1>
            <p className="asset-description">{asset.description}</p>
            <div className="asset-buttons">
              <button className="play-btn">▶ Play</button>
              <button className="info-btn">ℹ More Info</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
