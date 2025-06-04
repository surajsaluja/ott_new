import { useState, useEffect } from 'react';
import FocusableButton from '../../Common/FocusableButton';
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import useBanner from './Hooks/useBanner'
import {formatTime} from '../../../Utils';
import './index.css';

const Banner = ({ data: asset = null, banners = [] }) => {
  const {
    showBanner,
    videoRef,
    showOverlay,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef
  } = useBanner(asset, banners);

  const [transitionClass, setTransitionClass] = useState('');
  const [currentAsset, setCurrentAsset] = useState(asset);

  useEffect(() => {
    if (asset?.mediaID !== currentAsset?.mediaID) {
      setTransitionClass('fade-out');
      setTimeout(() => {
        setCurrentAsset(asset);
        setTransitionClass('fade-in');
      }, 300);
    }
  }, [asset, currentAsset]);

  if (!asset && banners.length === 0) return null;

  const renderMedia = () => {
    if (showBanner && banners.length > 0 && banners[0].fullPageBanner) {
      return <img key="banner-image" src={banners[0].fullPageBanner} className={`banner-video ${transitionClass}`} />;
    }

    if (asset?.trailerUrl && asset.fullPageBanner) {
      return (
        <>
          {!isVideoLoaded && <img key="banner-poster" src={asset.fullPageBanner} className={`banner-video ${transitionClass}`}/>}
          { <video
            key="banner-video"
            ref={videoRef}
            className={`banner-video ${transitionClass}`}
            autoPlay={false} // Let the effect in useBanner handle autoplay after loadeddata
            poster={asset.fullPageBanner}
            playsInline
            muted
            style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          />}
        </>
      );
    }

    return <img key="asset-image" src={asset?.fullPageBanner} className={`banner-video ${transitionClass}`} />;
  };


  const renderMediaDetails = () => {
    let mediaTitle = '';
    let title = '';
    let releasedYear = '';
    let ageRangeId = '';
    let shortDescription = '';
    let duration = '';
    let genre = '';
    let rating = '';
    let isWatchTrailerButton = false;
    let isPlayButton = false;

    if (showBanner && banners.length > 0) {
      title = banners[0].mediaTitle;
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

    if (asset) {
      title = `Is P : ${isPlaying} + is V : ${isVideoLoaded}`;
      mediaTitle = asset.mediaTitle;
      releasedYear = asset.releasedYear;
      ageRangeId = asset.ageRangeId;
      shortDescription = asset.shortDescription;
      duration = asset.duration;
      genre = asset.genre;
      rating = asset.rating;
      isWatchTrailerButton = false; // Show trailer button if trailer URL exists
      isPlayButton = false; // Show play button if no trailer
    }

    return (<div className={`asset-info ${transitionClass}`}>
      <h1 className="title">{title}</h1>
      <div className="tags">
        {releasedYear && <span><i><MdOutlineDateRange /></i>{releasedYear}</span>}
        {rating && <span><i><MdStarRate /></i>{rating}</span>}
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
        {isWatchTrailerButton && <FocusableButton className='trailer-btn' focusClass={'trailer-btn-focus'} text={'Watch Trailer'} onEnterPress={()=>watchMediaVOD(true)} />}
        {isPlayButton && <FocusableButton className='play-btn' focusClass={'play-btn-focus'} text={'Play'} onEnterPress={()=>watchMediaVOD(false)} />} {/* Assuming watchMediaVOD also handles playing the full content */}
      </div>
    </div>);
  };

  return (
    <div className="top-banner">
      <div className="banner-video-container">
        {renderMedia()}
        {showOverlay && (
          <div className="banner-overlay">
            {/* <div className="banner-gradient" /> */}
            <div className='overlay overlay-ltr'></div>
            {renderMediaDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;