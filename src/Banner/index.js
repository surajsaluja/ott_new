import React, { useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './index.css';

const Banner = ({ data: asset = null, banners = [] }) => {
  const [videoElement, setVideoElement] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

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
    const onPlaying = () => {};
    const onEnded = () => {};

    videoElement.pause();
    videoElement.src = '';

    videoElement.addEventListener('loadeddata', onLoadedData);
    videoElement.addEventListener('playing', onPlaying);
    videoElement.addEventListener('ended', onEnded);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(asset.trailerUrl);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = asset.trailerUrl;
    }

    return () => {
      videoElement.removeEventListener('loadeddata', onLoadedData);
      videoElement.removeEventListener('playing', onPlaying);
      videoElement.removeEventListener('ended', onEnded);
      if (hls) hls.destroy();
    };
  }, [asset?.trailerUrl, videoElement]);

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

  const renderMediaDetails = () =>{
    let mediaTitle = '';
    let title  = '';
    let releasedYear = '';
    let ageRangeId  = '';
    let shortDescription  = '';
    let duration  = '';
    let genre  = '';
    let rating  = '';
    let isWatchTrailerButton = false;
    let isPlayButton = false;

    if(showBanner && banners.length > 0){
        title  = banners[0].title;
        mediaTitle = banners[0].mediaTitle;
        releasedYear = banners[0].releasedYear;
        ageRangeId = banners[0].ageRangeId;
        shortDescription = banners[0].shortDescription;
        duration = banners[0].duration;
        genre = banners[0].genre;
        rating = banners[0].rating;
        isWatchTrailerButton = banners[0].isWatchTrailerButton;
        isPlayButton = banners[0].isPlayButton;
    }

    if(asset){
        title  = asset.title;
        mediaTitle = asset.mediaTitle;
        releasedYear = asset.releasedYear;
        ageRangeId = asset.ageRangeId;
        shortDescription = asset.shortDescription;
        duration = asset.duration;
        genre = asset.genre;
        rating = asset.rating;
        isWatchTrailerButton = false;
        isPlayButton = false;
    }

    return(<div className="asset-info">
              <h1 className="title">{title}</h1>
        <div className="tags">
          <span>{releasedYear}</span>
          <span>{rating}</span>
          <span>{duration}</span>
          <span>{ageRangeId}</span>
        </div>
        <p className="description">{shortDescription}</p>
        <div className="genres">
          {genre}
        </div>
        </div>)
  }

  return (
    <div className="top-banner">
      <div className="banner-video-container">
        {renderMedia()}
        {showOverlay && (
          <div className="banner-overlay">
            <div className="banner-gradient" />
            {renderMediaDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;