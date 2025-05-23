import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';
import { FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';
import { MdFastForward, MdFastRewind, MdMultilineChart, MdOutlinePause, MdPlayArrow } from 'react-icons/md';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import VirtualThumbnailStripWithSeekBar from '../VirtualList'
import useSeekHandler from './useSeekHandler';

const SEEKBAR_THUMBIAL_STRIP_FOCUSKEY = 'PREVIEW_THUMBNAIL_STRIP'
const VIDEO_PLAYER_FOCUS_KEY  = 'VIDEO_PLAYER';

const VideoPlayer = () => {
  const location = useLocation();
  const { src, title: movieTitle, thumbnailBaseUrl: THUMBNAIL_BASE_URL } = location.state || {};
  const videoRef = useRef(null);
  const playIconTimeout = useRef(null);
  const inactivityTimeout = useRef(null);
  const seekIconTimeout = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekAmount, setSeekAmount] = useState(10);
  const [isSeekbarVisible,setIsSeekbarVisible] = useState(false);
  const [isThumbnailStripVisible,setIsThumbnailStripVisible] = useState(false);

  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const userActivityRef = useRef(null);
  const isSeekingRef = useRef(null);
  const isThumbnailStripVisibleRef = useRef(null);
  const resumePlayTimeoutRef = useRef(null);
  let inactivityDelay = 5000;
  const seekInterval = 10;

  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey: VIDEO_PLAYER_FOCUS_KEY,
    trackChildren: true,
  });

  const customResolutions = [
    { id: -1, label: 'Auto', resolution: 'Auto', minBandwidth: 'auto', maxBandwidth: 'auto' },
    { id: 1, label: 'Data Saver', resolution: '960x540', minBandwidth: 0, maxBandwidth: 1000000 },
    { id: 2, label: 'HD', resolution: '1280x720', minBandwidth: 1000001, maxBandwidth: 3000000 },
    { id: 3, label: 'Full HD', resolution: '1920x1080', minBandwidth: 3000001, maxBandwidth: 5000000 },
  ];

  // const THUMBNAIL_BASE_URL = 'https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail';
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 700);
  }, []);

  const handleBackPressed = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    }
  }, []);

  const handleFocusSeekBar = () => {
    setFocus(SEEKBAR_THUMBIAL_STRIP_FOCUSKEY);
    setIsSeekbarVisible(true);
  }

  const resetInactivityTimeout = useCallback(() => {
    setIsUserActive(true);
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      if (!isSeekingRef.current) {
        setIsUserActive(false);
        setFocus('Dummy_Btn');
      }
    }, inactivityDelay);
  }, []);

const safePlay = async () => {
  try {
    await videoRef.current?.play();
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Play error:', error);
    }
  }
};

  const handleSetIsSeeking = (val) => {
    
  isSeekingRef.current = val;
  if (val) {
    // Clear any pending resumePlay
    clearTimeout(resumePlayTimeoutRef.current);

    // Pause immediately on start of seek
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsSeekbarVisible(true);
  } else {
    // Debounce resume play — wait 300ms after seeking ends
    resumePlayTimeoutRef.current = setTimeout(() => {
      safePlay();
    }, 300);
    setIsSeekbarVisible(false);
    resetInactivityTimeout();
  }
};

const handleThumbnialStripVisibility = (val) =>{
  isThumbnailStripVisibleRef.current = val;
  setIsThumbnailStripVisible(val);
}

  const { seekMultiplier, seekDirection } = useSeekHandler(
    videoRef,
    seekInterval,
    handleSetIsSeeking,
    togglePlayPause,
    handleBackPressed,
    handleFocusSeekBar,
    sidebarOpen,
    userActivityRef,
    resetInactivityTimeout,
    isSeekbarVisible,
    isThumbnailStripVisibleRef,
    setIsUserActive
  );


  useEffect(() => {
    const showSeekIcons = (direction) => {
      if (direction && direction != null) {
        setSeekAmount(seekMultiplier * seekInterval);
        setShowSeekIcon(true);

        clearTimeout(seekIconTimeout.current);
        seekIconTimeout.current = setTimeout(() => setShowSeekIcon(false), 1000);
      }else{
        setShowSeekIcon(false);
      }
    }

    if(seekMultiplier && seekMultiplier > 0 && isSeekingRef.current){
      showSeekIcons(seekDirection);
    }


    // if (isSeekingRef.current && seekMultiplier && seekMultiplier > 3) {
    //   handleFocusSeekBar();
    // } else {
    //   showSeekIcons(seekDirection);
    // }

  //   if (isSeekingRef.current && !isSeekingRef.current) {
  //   resetInactivityTimeout();
  // }

  }, [seekMultiplier])

  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setCaptions([{ id: -1, label: 'Off' }, ...data.subtitleTracks.map(track => ({
          id: track.id,
          label: track.name || `Subtitle ${track.id}`,
        }))]);

        setAudioTracks(data.audioTracks.map(track => ({
          id: track.id,
          label: track.name || `Audio ${track.id}`,
        })));

        video.play();
      });

      video.hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play();
    }
  }, [src]);

  useEffect(() => {

    const video = videoRef.current;
    // video?.addEventListener('ended', () => {console.log('ended')});
    // video?.addEventListener('waiting', () => {console.log('waiting')});
    //     video?.addEventListener('playing', () => {console.log('playing')});
    //     video?.addEventListener('canplay', () => {console.log('can play')});

    initializePlayer();
    resetInactivityTimeout();

    return () => {
      video?.hls?.destroy();
      clearTimeout(playIconTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(resumePlayTimeoutRef.current);
    };
  }, [initializePlayer, resetInactivityTimeout]);

  useEffect(() => {
    userActivityRef.current = isUserActive;
    if(userActivityRef.current){
    }else{
    }
  }, [isUserActive]);


  if (!src) return <div>Missing video source</div>;


  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="video-container">
        <video ref={videoRef} className="video-player" controls={false} muted />

        <Popup
          onVideoSettingsPressed={() => setSidebarOpen(true)}
          onBackPress={handleBackPressed}
          videoRef={videoRef}
          title={movieTitle}
          focusKey={'video-overlay'}
          isVisible={isUserActive}
          resetInactivityTimeout={resetInactivityTimeout}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
        />

         <VirtualThumbnailStripWithSeekBar
          videoRef={videoRef}
          setIsSeeking={handleSetIsSeeking}
          focusKey={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          onClose={()=>{setIsUserActive(false)}}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
          key={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          setIsSeekbarVisible={setIsSeekbarVisible} // used to get input from component is visible from focus
          isThumbnailStripVisible = {isThumbnailStripVisible} // to control thumnail strip 
          setIsThumbnailStripVisible = {handleThumbnialStripVisibility} // used to get input if thumbnail strip is visible
          isVisible = {isUserActive || isSeekbarVisible} // used to make seekbar visible from prent
        />

        {showSeekIcon && (
          <div className="seek-icon">
            {seekDirection === 'forward' && (
              <div className="forward">
                <p>{seekAmount}s</p> <MdFastForward />
              </div>
            )} 
            {seekDirection === 'reverse' && (
              <div className="rewind">
                <MdFastRewind /> <p>{seekAmount}s</p>
              </div>
            )}
          </div>
        )}

        {showPlayIcon && (
          <div className="play-icon">
            {isPlaying ? <MdPlayArrow /> : <MdOutlinePause />}
          </div>
        )}

        {sidebarOpen && (
          <SideBar_Tab
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            captions={captions}
            selectedCaption={selectedCaption}
            onCaptionSelect={setSelectedCaption}
            qualityLevels={customResolutions}
            selectedQuality={selectedQuality}
            onQualitySelect={setSelectedQuality}
            audioTracks={audioTracks}
            selectedAudio={selectedAudio}
            onAudioSelect={setSelectedAudio}
          />
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default VideoPlayer;