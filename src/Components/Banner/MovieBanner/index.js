import { useState, useEffect, useRef } from 'react';
import FocusableButton from '../../Common/FocusableButton';
import { getEclipsedTrimmedText } from '../../../Utils';
import { FocusContext, setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import useBanner from './Hooks/useBanner';
import './index.css';

const SHOW_DETAIL_BTN_FOCUS_KEY = 'SHOW_DETAIL_BTN_FOCUS_KEY';
const WATCH_MOVIE_BANNER_BTN_FOCUS_KEY = 'WATCH_MOVIE_BANNER_BTN_FOCUS_KEY'

const Banner = ({ data: asset = null, banners = [] }) => {
  const {
    showBanner,
    videoRef,
    showOverlay = true,
    watchMediaVOD,
    isVideoLoaded,
    isPlaying,
    handleImageLoaded,
    isImageLoaded,
    showMediaDetail
  } = useBanner(asset, banners);


  const [transitionClass, setTransitionClass] = useState('');
  const [displayAsset, setDisplayAsset] = useState(asset);
  const [displayBanners, setDisplayBanners] = useState(banners);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const prevAsset = useRef(asset);
  const prevBanners = useRef(banners);
  const hasAutoFocused = useRef(false);

    const { ref, focusSelf, focusKey } = useFocusable({ 
    focusKey: 'MOVIE_BANNER', 
    focusable: banners.length>0,
  // saveLastFocusedChild: true,
// preferredChildFocusKey: SHOW_DETAIL_BTN_FOCUS_KEY, 
onFocus:()=>{
 setTimeout(() => {
    const targetFocusKey = showPlayButton
      ? WATCH_MOVIE_BANNER_BTN_FOCUS_KEY
      : SHOW_DETAIL_BTN_FOCUS_KEY;

    setFocus(targetFocusKey);
  }, 10);
} });

  // Handle transitions between banners/assets
  useEffect(() => {
    const assetChanged = asset?.mediaID !== prevAsset.current?.mediaID;
    const bannersChanged = JSON.stringify(banners) !== JSON.stringify(prevBanners.current);

    if (assetChanged || bannersChanged) {
      setIsTransitioning(true);
      setTransitionClass('fade-out');

      const timer = setTimeout(() => {
        prevAsset.current = asset;
        prevBanners.current = banners;
        setDisplayAsset(asset);
        setDisplayBanners(banners);
        setTransitionClass('fade-in');
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [asset, banners]);

  // Reset auto-focus flag when banners change
  useEffect(() => {
    hasAutoFocused.current = false;
  }, [banners]);

  // Auto-focus logic
  useEffect(() => {
    if (!isTransitioning && !hasAutoFocused.current && asset == null) {
      const timer = setTimeout(() => {
        focusSelf();
        hasAutoFocused.current = true;
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, asset, focusSelf]);

  // Determine when to show the play button
  useEffect(() => {
    if (!asset && displayBanners.length > 0) {
      setShowPlayButton(displayBanners[0]?.isPlayButton ?? false);
    }
  }, [asset, displayBanners]);

  // Compute current display source
  const showBannerOnly = !asset && displayBanners.length > 0;
  const currentDisplayAsset = isTransitioning ? prevAsset.current : displayAsset;
  const currentDisplayBanners = isTransitioning ? prevBanners.current : displayBanners;

  if (!currentDisplayAsset && currentDisplayBanners.length === 0) return null;

  const renderMedia = () => {
    const banner = currentDisplayBanners[0];

    if (showBannerOnly && banner?.mobileThumbnail) {
      return (
        <img
          key="banner-image"
          src={banner.mobileThumbnail || banner.fullPageBanner}
          className={`banner-video-w-100 ${transitionClass}`}
          onLoad={handleImageLoaded}
          style={{ opacity: isImageLoaded ? 1 : 0 }}
        />
      );
    }

    if (currentDisplayAsset?.trailerUrl && currentDisplayAsset?.fullPageBanner) {
      return (
        <>
          {!isVideoLoaded && (
            <img
              key="poster"
              src={currentDisplayAsset.fullPageBanner}
              className={`banner-video-w-70 ${transitionClass}`}
              onLoad={handleImageLoaded}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
          )}
          <video
            key="video"
            ref={videoRef}
            className={`banner-video-w-70 ${transitionClass}`}
            autoPlay={false}
            poster={currentDisplayAsset.fullPageBanner}
            playsInline
            style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          />
        </>
      );
    }

    return (
      <img
        key="fallback-image"
        src={currentDisplayAsset?.fullPageBanner}
        className={`banner-video-w-70 ${transitionClass}`}
        onLoad={handleImageLoaded}
        style={{ opacity: isImageLoaded ? 1 : 0 }}
      />
    );
  };

   const renderDetails = () => {
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

    if (displayBanners && displayBanners.length > 0) {
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
        <div className="asset-genres" style={{ bottom: `${displayAsset ? 0 : 22}% `}}>
          {genre && genre.split(',').map((genre, idx) => (
            <span key={idx} className="asset-genre">{genre}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderButtons = () => {
    if (!showBannerOnly) return null;

    const banner = currentDisplayBanners[0];
    return (
      <>
        {showPlayButton && (
          <FocusableButton
            className="banner-play-btn"
            focusClass="play-btn-focus"
            text="Watch Now"
            focuskey={WATCH_MOVIE_BANNER_BTN_FOCUS_KEY}
            onEnterPress={() => watchMediaVOD(false)}
          />
        )}
        <FocusableButton
          className="banner-play-btn"
          focusClass="play-btn-focus"
          text="Show Details"
          focuskey={SHOW_DETAIL_BTN_FOCUS_KEY}
          onEnterPress={showMediaDetail}
        />
      </>
    );
  };

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="top-banner" style={{ height: asset ? '61vh' : '100vh' }}>
        <div className="banner-video-container">
          {renderMedia()}

          {showOverlay && (
            <div className="banner-overlay">
              <div className={`overlay ${showBannerOnly ? 'banner-overlay-bottom-gradient' : 'overlay-ltr'}`} />
              {renderDetails()}
            </div>
          )}

          <div className="asset-buttons" ref={ref}>
            {renderButtons()}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Banner;
