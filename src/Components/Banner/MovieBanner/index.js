import { useState, useEffect, useRef } from 'react';
import FocusableButton from '../../Common/FocusableButton';
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import useBanner from './Hooks/useBanner'
import { formatTime, getEclipsedTrimmedText } from '../../../Utils';
import './index.css';

const Banner = ({ data: asset = null, banners = [] }) => {
  const {
    showBanner,
    videoRef,
    showOverlay=true,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    videoPlayerRef,
    handleImageLoaded,
    isImageLoaded,
    showMediaDetail
  } = useBanner(asset, banners);

  const [transitionClass, setTransitionClass] = useState('');
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [currentBanners, setCurrentBanners] = useState(banners);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevAssetRef = useRef(asset);
  const prevBannersRef = useRef(banners);

  useEffect(() => {
    if (asset?.mediaID !== currentAsset?.mediaID || JSON.stringify(banners) !== JSON.stringify(currentBanners)) {
      setIsTransitioning(true);
      setTransitionClass('fade-out');

      const timer = setTimeout(() => {
        prevAssetRef.current = currentAsset;
        prevBannersRef.current = currentBanners;
        setCurrentAsset(asset);
        setCurrentBanners(banners);
        setTransitionClass('fade-in');
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [asset, banners, currentAsset, currentBanners]);

  // Determine which data to display during transition
  const displayAsset = isTransitioning ? prevAssetRef.current : currentAsset;
  const displayBanners = isTransitioning ? prevBannersRef.current : currentBanners;
  const displayShowBanner = isTransitioning ?
    (prevBannersRef.current.length > 0 && !currentAsset) :
    (currentBanners.length > 0 && !currentAsset);

  if (!displayAsset && displayBanners.length === 0) return null;

  const renderMedia = () => {
    if (displayShowBanner && displayBanners.length > 0 && displayBanners[0].mobileThumbnail) {
      return <img key="banner-image"
        src={displayBanners[0].mobileThumbnail || displayBanners[0].fullPageBanner}
        className={`banner-video-w-100 ${transitionClass}`}
        onLoad={handleImageLoaded}
        style={{ opacity: (isImageLoaded ? 1 : 0) }}
      />;
    }

    if (displayAsset && displayAsset?.trailerUrl && displayAsset.fullPageBanner) {
      return (
        <>
          {!isVideoLoaded && displayAsset.fullPageBanner &&
            <img
              key="banner-poster"
              src={displayAsset.fullPageBanner}
              className={`banner-video-w-70 ${transitionClass}`}
              onLoad={handleImageLoaded}
              style={{ opacity: (isImageLoaded ? 1 : 0) }}
            />
          }
          <video
            key="banner-video"
            ref={videoRef}
            className={`banner-video-w-70 ${transitionClass}`}
            autoPlay={false}
            poster={displayAsset.fullPageBanner}
            playsInline
            style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          />
        </>
      );
    }

    return <img key="asset-image"
      src={displayAsset?.fullPageBanner}
      className={`banner-video-w-70 ${transitionClass}`}
      onLoad={handleImageLoaded}
      style={{ opacity: (isImageLoaded ? 1 : 0) }} />;
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
    let isShowDetailButton = false;

    if (displayShowBanner && displayBanners.length > 0) {
      // title = displayBanners[0].mediaTitle;
      // mediaTitle = displayBanners[0].mediaTitle;
      // releasedYear = displayBanners[0].releasedYear;
      // ageRangeId = displayBanners[0].ageRangeId;
      // shortDescription = displayBanners[0].shortDescription;
      // duration = displayBanners[0].duration;
      // genre = displayBanners[0].genre;
      // rating = displayBanners[0].rating;
      isPlayButton = displayBanners[0].isPlayButton;
      isShowDetailButton = true;
    }

    if (displayAsset) {
      title = displayAsset.title;
      mediaTitle = displayAsset.mediaTitle;
      releasedYear = displayAsset.releasedYear;
      ageRangeId = displayAsset.ageRangeId;
      shortDescription = displayAsset.shortDescription;
      duration = displayAsset.duration;
      genre = displayAsset.genre;
      rating = displayAsset.rating;
      isWatchTrailerButton = false;
      isPlayButton = false;
      isShowDetailButton = false;
    }

    return (
      <div className={`asset-info ${transitionClass}`}>
        <h1 className="asset-title">{title}</h1>
        <div className="asset-tags">
          {/* {releasedYear && <span><i><MdOutlineDateRange /></i>{releasedYear}</span>} */}
          {/* {rating && <span><i><MdStarRate /></i>{rating}</span>} */}
          {/* {duration && <span><i><MdOutlineTimer /></i>{formatTime(duration)}</span>} */}
          {/* {ageRangeId && <span><i><GiVibratingShield /></i>{ageRangeId}</span>} */}
        </div>
        <p className="asset-description" >{getEclipsedTrimmedText(shortDescription, 120)}</p>
        <div className="asset-genres" style={{ bottom: `${displayAsset ? 0 : 22}%` }}>
          {genre && genre.split(',').map((genre, idx) => (
            <span key={idx} className="asset-genre">{genre}</span>
          ))}
        </div>
        <div className='asset-buttons'>
          {/* {isWatchTrailerButton && <FocusableButton className='trailer-btn' focusClass={'trailer-btn-focus'} text={'Watch Trailer'} onEnterPress={() => watchMediaVOD(true)} />} */}
          {isPlayButton && <FocusableButton className='banner-play-btn' focusClass={'play-btn-focus'} text={'Watch Now'} onEnterPress={() => watchMediaVOD(false)} />}
          {isShowDetailButton && <FocusableButton className='banner-play-btn' focusClass={'play-btn-focus'} text={'Show Details'} onEnterPress={() => showMediaDetail()} />}
        </div>
      </div>
    );
  };

  return (
    <div className="top-banner" style={{height:`${asset==null ? '100vh' :  '61vh'}`}}>
      <div className="banner-video-container">
        {renderMedia()}
        {showOverlay && (
          <div className="banner-overlay">
            <div className={`overlay ${displayShowBanner ?  'banner-overlay-bottom-gradient' : 'overlay-ltr'}`}></div>
            {renderMediaDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;