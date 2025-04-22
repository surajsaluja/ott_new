import React, { useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import FocusableButton from '../Common/FocusableButton'
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import useBanner from './Hooks/useBanner'
import './index.css';

const Banner = ({ data: asset = null, banners = [] }) => {
  
const {
showBanner,
videoRef,
formatTime,
showOverlay,
watchMediaVOD
} = useBanner(asset,banners);

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
        title  = banners[0].mediaTitle;
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
          {releasedYear && <span><i><MdOutlineDateRange /></i>{releasedYear}</span>}
          {rating &&  <span><i><MdStarRate /></i>{rating}</span>}
          {duration && <span><i><MdOutlineTimer /></i>{formatTime(duration)}</span>}
          {ageRangeId && <span><i><GiVibratingShield /></i>{ageRangeId}</span>}
        </div>
        <p className="description">{shortDescription}</p>
        <div className="genres">
        {genre && genre.split(',').map((genre, idx) => (
            <span key={idx} className="genre">{genre}</span>
          ))}
        </div>
        <div className='asset-buttons'>
          {isWatchTrailerButton && <FocusableButton className='trailer-btn' focusClass={'trailer-btn-focus'} text={'Watch Trailer'} onEnterPress={watchMediaVOD}/>}
          {isPlayButton && <FocusableButton className='play-btn' focusClass={'play-btn-focus'} text={'Play Movie'}/>}
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