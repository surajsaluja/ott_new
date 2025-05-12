import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';
import { setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';
import { MdFastForward, MdFastRewind, MdOutlinePause, MdPlayArrow } from 'react-icons/md';

const KEY_ENTER = 13;
const KEY_BACK = 10009;
const KEY_ESC = 8;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const VideoPlayer = () => {
  const location = useLocation();
  const { src, title: movieTitle } = location.state;

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

  const seekSpeed = 10;
  const inactivityDelay = 3000;

  const customResolutions = [
    { id: -1, label: 'Auto', resolution: 'Auto', minBandwidth: 'auto', maxBandwidth: 'auto' },
    { id: 1, label: 'Data Saver', resolution: '960x540', minBandwidth: 0, maxBandwidth: 1000000 },
    { id: 2, label: 'HD', resolution: '1280x720', minBandwidth: 1000001, maxBandwidth: 3000000 },
    { id: 3, label: 'Full HD', resolution: '1920x1080', minBandwidth: 3000001, maxBandwidth: 5000000 },
  ];

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
    const video = videoRef.current;
    if (!video) return;

    if(seekMultiplierRef.current > 3){
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

  const handleKeyDown = useCallback((e) => {
    if (sidebarOpen) {
      if (e.keyCode === KEY_BACK || e.keyCode === KEY_ESC) {
        setSidebarOpen(false);
      }
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
      case KEY_BACK:
      case KEY_ESC:
        handleBackPressed();
        break;
      default:
        resetInactivityTimeout();
        break;
    }
  }, [sidebarOpen, togglePlayPause, seekVideo, handleBackPressed]);

  const resetInactivityTimeout = useCallback(() => {
    setIsUserActive(true);
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
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
    window.addEventListener('keydown', handleKeyDown);
    const video = videoRef.current;
    video?.addEventListener('ended', () => setIsPlaying(false));

    initializePlayer();
    resetInactivityTimeout();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      video?.removeEventListener('ended', () => setIsPlaying(false));
      video?.hls?.destroy();

      clearTimeout(playIconTimeout.current);
      clearTimeout(seekIconTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(seekHoldTimeout.current);
    };
  }, [initializePlayer, handleKeyDown, resetInactivityTimeout]);

  return (
    <div className="video-container">
      <video ref={videoRef} className="video-player" controls={false} />

      <Popup
        onVideoSettingsPressed={() => setSidebarOpen(true)}
        onBackPress={handleBackPressed}
        videoRef={videoRef}
        title={movieTitle}
        focusKey={'video-overlay'}
        isVisible={isUserActive}
        resetInactivityTimeout={resetInactivityTimeout}
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
  );
};

export default VideoPlayer;