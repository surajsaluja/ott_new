import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';
import { FocusContext, getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';
import { MdFastForward, MdFastRewind, MdOutlinePause, MdPlayArrow } from 'react-icons/md';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import VirtualThumbnailStripWithSeekBar from '../VirtualList';

const KEY_ENTER = 13;
const KEY_BACK = 10009;
const KEY_ESC = 8;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const SEEKBAR_PREVIEW_FOCUS_KEY = 'SEEK_PREVIEW_CONTAINER'

const VideoPlayer = () => {
  const location = useLocation();
  const { src, title: movieTitle, thumbnailBaseUrl: THUMBNAIL_BASE_URL } = location.state || {};
  const videoRef = useRef(null);
  const playIconTimeout = useRef(null);
  const inactivityTimeout = useRef(null);
  const seekIconTimeout = useRef(null);
  const seekHoldTimeout = useRef(null);
  const seekMultiplierRef = useRef(1);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekDirection, setSeekDirection] = useState(null);
  const [seekAmount, setSeekAmount] = useState(10);

  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const userActivityRef = useRef(null);

  const seekSpeed = 10;
  const inactivityDelay = 3000;

  const { ref, focusKey: currentFocusKey, hasFocusedChild, focused } = useFocusable({
    focusKey: "VIDEO_PLAYER",
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

  const seekVideo = useCallback((baseSeconds, direction, isHold = false) => {
    console.log('inSeek');
    const video = videoRef.current;
    if (!video) return;

    if (seekMultiplierRef.current > 3) {
      setIsUserActive(true);
      return;
    }

    const seekBy = baseSeconds * seekMultiplierRef.current;
    video.currentTime += direction === 'forward' ? seekBy : -seekBy;

    setSeekDirection(direction);
    setSeekAmount(seekBy);
    setShowSeekIcon(true);

    clearTimeout(seekIconTimeout.current);
    seekIconTimeout.current = setTimeout(() => setShowSeekIcon(false), 800);

    if (isHold) {
      seekMultiplierRef.current += 1;
      clearTimeout(seekHoldTimeout.current);
      seekHoldTimeout.current = setTimeout(() => {
        seekMultiplierRef.current = 1;
      }, 1000);
    } else {
      seekMultiplierRef.current = 1;
    }
  }, []);

  const handleBackPressed = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    }
  }, []);

  const resetInactivityTimeout = useCallback(() => {
    setIsUserActive(true);
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      console.log('user Inactivity TimeOut');
      setIsUserActive(false);
      setFocus('Dummy_Btn');
    }, inactivityDelay);
  }, []);

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

  const handleKeyDown = (e) => {
    console.log(`has focused child : ${hasFocusedChild}`);
    if (hasFocusedChild) return;
    if (sidebarOpen) {
      if (e.keyCode === KEY_BACK || e.keyCode === KEY_ESC) {
        setSidebarOpen(false);
      }
      return;
    }

    if (userActivityRef.current) {
      console.log('User Active');
      return;
    }

    switch (e.keyCode) {
      case KEY_ENTER:
        togglePlayPause();
        break;
      case KEY_LEFT:
        seekVideo(seekSpeed, 'backward', true);
        break;
      case KEY_RIGHT:
        seekVideo(seekSpeed, 'forward', true);
        break;
      case KEY_DOWN:
        setFocus(SEEKBAR_PREVIEW_FOCUS_KEY);
        break;
      case KEY_BACK:
      case KEY_ESC:
        handleBackPressed();
        break;
      default:
        resetInactivityTimeout();
        break;
    }
  };

  const handleKeyUp = (e) => {
    if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT) {
      seekMultiplierRef.current = 1; // reset seek speed after long press
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [hasFocusedChild, sidebarOpen, togglePlayPause, seekVideo, handleBackPressed, resetInactivityTimeout]);


  useEffect(() => {

    const video = videoRef.current;
    video?.addEventListener('ended', () => setIsPlaying(false));

    initializePlayer();
    resetInactivityTimeout();

    return () => {
      video?.hls?.destroy();

      clearTimeout(playIconTimeout.current);
      clearTimeout(seekIconTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(seekHoldTimeout.current);
    };
  }, [initializePlayer, resetInactivityTimeout]);

  useEffect(() => {
    userActivityRef.current = isUserActive;
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
                  thumbnailBaseUrl={THUMBNAIL_BASE_URL}
                  onClose={()=>{}}
                  focusKey={SEEKBAR_PREVIEW_FOCUS_KEY}
                  resetInactivityTimeout = {resetInactivityTimeout}
                />

        {showSeekIcon && (
          <div className="seek-icon">
            {seekDirection === 'forward' ? (
              <div className="forward">
                <p>{seekAmount}s</p> <MdFastForward />
              </div>
            ) : (
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