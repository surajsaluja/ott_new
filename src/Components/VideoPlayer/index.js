import React, { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import "./index.css";
import {
  FocusContext,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import Popup from "./Popup";
import SideBar_Tab from "./SideBar_Tab";
import { useLocation, useHistory } from "react-router-dom";
import {
  MdFastForward,
  MdFastRewind,
  MdOutlinePause,
  MdPlayArrow,
} from "react-icons/md";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import VirtualThumbnailStripWithSeekBar from "../VirtualList";
import useSeekHandler from "./useSeekHandler";
import { getDeviceInfo } from "../../Utils";
import { useUserContext } from "../../Context/userContext";
import { sendVideoAnalytics } from "../../Service/MediaService";
import FocusableButton from "../Common/FocusableButton";
import { useSignalR } from "../../Hooks/useSignalR";
import StreamLimitModal from "./StreamLimitError";

const SEEKBAR_THUMBIAL_STRIP_FOCUSKEY = "PREVIEW_THUMBNAIL_STRIP";
const VIDEO_PLAYER_FOCUS_KEY = "VIDEO_PLAYER";
const VIDEO_OVERLAY_FOCUS_KEY = "VIDEO_OVERLAY";
const SKIP_BTN_FOCUS_KEY = "SKIP_BUTTON";
const SKIP_INTRO_TEXT = 'Skip Intro';
const SKIP_RECAP_TEXT = 'Skip Recap';
const SKIP_NEXT_EPISODE_TEXT = 'Next Episode';

const VideoPlayer = () => {
  const location = useLocation();
  const history = useHistory();
  const {
    src,
    title: movieTitle,
    thumbnailBaseUrl: THUMBNAIL_BASE_URL,
    mediaId,
    isTrailer,
    onScreenInfo,
    skipInfo,
    playDuration
  } = location.state || {};
  const deviceInfo = getDeviceInfo();
  const { userObjectId } = useUserContext();
  const videoRef = useRef(null);
  const playIconTimeout = useRef(null);
  const inactivityTimeout = useRef(null);
  const seekIconTimeout = useRef(null);
  const isSideBarOpenRef = useRef();

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekAmount, setSeekAmount] = useState(10);
  const [isSeekbarVisible, setIsSeekbarVisible] = useState(false);
  const [isThumbnailStripVisible, setIsThumbnailStripVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamLimitError,setStreamLimitError] = useState(false);

  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const [showSkipButtons, setShowSkipButtons] = useState(false);
  const [skipButtonText, setSkipButtonText] = useState('');
  const showSkipButtonsRef = useRef(false);
  const skipButtonTextRef = useRef('');


  const userActivityRef = useRef(null);
  const isSeekingRef = useRef(null);
  const isSeekbarVisibleRef = useRef(null);
  const isThumbnailStripVisibleRef = useRef(null);
  const resumePlayTimeoutRef = useRef(null);
  let inactivityDelay = 5000;
  const seekInterval = 10;
  const analyticsHistoryIdRef = useRef();
  const activeTabsRef = useRef(null);

  // REFS TO MANTAIN PLAY TIME FOR ANALYTICS
  const watchTimeRef = useRef(0); // Total watch time in seconds
  const watchTimeIntervalRef = useRef(null);
  // const seekDirection = null;
  // const seekMultiplier = 0;

  // SignalR
  const { isConnected, playCapability, connectManuallyV2, disconnectManually } = useSignalR();



  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey: VIDEO_PLAYER_FOCUS_KEY,
    trackChildren: true,
    onArrowPress:(direction)=>{
      if(direction === 'left' || direction === 'right'){
        console.log('arrow press from videoRef: '+direction);
      }
    }
  });

  const customResolutions = [
    {
      id: -1,
      label: "Auto",
      resolution: "Auto",
      minBandwidth: "auto",
      maxBandwidth: "auto",
    },
    {
      id: 1,
      label: "Data Saver",
      resolution: "960x540",
      minBandwidth: 0,
      maxBandwidth: 1000000,
    },
    {
      id: 2,
      label: "HD",
      resolution: "1280x720",
      minBandwidth: 1000001,
      maxBandwidth: 3000000,
    },
    {
      id: 3,
      label: "Full HD",
      resolution: "1920x1080",
      minBandwidth: 3000001,
      maxBandwidth: 5000000,
    },
  ];

  const startWatchTimer = () => {
    if (watchTimeIntervalRef.current) return;
    watchTimeIntervalRef.current = setInterval(() => {
      if (!isSeekingRef.current && videoRef?.current && !videoRef?.current.paused) {
        watchTimeRef.current += 1;
      }
    }, 1000);
  };

  const stopWatchTimer = () => {
    clearInterval(watchTimeIntervalRef.current);
    watchTimeIntervalRef.current = null;
  };

  const handleSetIsPlaying = (val) => {
    let video = videoRef.current;
    if (!video) return;
    try {
      if (val && video.paused) {
        startWatchTimer();
        video.play();
        setIsPlaying(true);
        return;
      } else if (!val && !video.paused) {
        stopWatchTimer();
        video.pause();
        sendAnalyticsForMedia();
        setIsPlaying(false);
      }
    } catch (error) {
    } finally { }
  }


  // const THUMBNAIL_BASE_URL = 'https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail';
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      // videoRef.current.play();
      handleSetIsPlaying(true);
    } else {
      // videoRef.current.pause();
      handleSetIsPlaying(false);
    }
    setShowPlayIcon(true);
    clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 700);
  }, []);

  const handleBackPressed = useCallback(() => {
    if(userActivityRef.current){
      setIsUserActive(false);
      setFocus('Dummy_Btn');
      return;
    }else if(isSideBarOpenRef.current){
      handleSidebarOpen(false);
      setIsUserActive(false);
      setFocus('Dummy_Btn');
      return;
    }else{
    history.goBack();
    return;
    }
  }, [isSideBarOpenRef, userActivityRef]);

  const handleSetAnalyticsHistoryId = (historyId) => {
    analyticsHistoryIdRef.current = historyId;
  }

  const switchCaption = (caption) => {
        if (videoRef.current.hls) {
            videoRef.current.hls.subtitleTrack = caption.id === -1 ? -1 : caption.id;
            setSelectedCaption(caption.id);
        }
    };

    const handleQualityChange = (quality) => {
        if (videoRef.current.hls) {
            if (quality.minBandwidth === 'auto') {
                videoRef.current.hls.currentLevel = -1; // Auto quality
            } else {
                const level = videoRef.current.hls.levels.findIndex(
                    (lvl) => lvl.bitrate >= quality.minBandwidth && lvl.bitrate <= quality.maxBandwidth
                );
                if (level !== -1) {
                    videoRef.current.hls.currentLevel = level;
                }
            }
        }
        setSelectedQuality(quality.id);
    };

    const handleAudioChange = (audio) => {
        if (videoRef.current.hls) {
            videoRef.current.hls.audioTrack = audio.id;
            setSelectedAudio(audio.id);
        }
    };

  const sendAnalyticsForMedia = async () => {
    try {
      var analyticsData = {};
      const playDuration = watchTimeRef.current;
      const currentPosition = videoRef?.current ? videoRef?.current.currentTime : 0;

      if (analyticsHistoryIdRef.current) {
        analyticsData = {
          "mediaId": mediaId,
          "userId": userObjectId,
          "deviceId": deviceInfo.deviceId,
          "userAgent": "Tizen",
          "playDuration": playDuration.toString(),
          "CurrentPosition": parseInt(currentPosition).toString(),
          "status": "Pause",
          "action": "AppNew",
          "historyid": analyticsHistoryIdRef.current,
          "DeviceType": 5,
          "DeviceName": deviceInfo.deviceName,
          "IsTrailer": isTrailer
        };
      } else {
        analyticsData = {
          "mediaId": mediaId,
          "userId": userObjectId,
          "deviceId": deviceInfo.deviceId,
          "userAgent": "Tizen",
          "playDuration": playDuration.toString(),
          "CurrentPosition": currentPosition.toString(),
          "status": "BrowserEvent",
          "action": "AppNew",
          "DeviceType": 5,
          "DeviceName": deviceInfo.deviceName,
          "IsTrailer": isTrailer
        };
      }

      const VideoAnalyticsRes = await sendVideoAnalytics(analyticsData);
      if (VideoAnalyticsRes && VideoAnalyticsRes.isSuccess) {
        if (!analyticsHistoryIdRef.current) {
          handleSetAnalyticsHistoryId(VideoAnalyticsRes.data)
        } else {
          // History Id already set and just need to update data on historyId
        }
      } else {
        //Error fetching response
      }
    } catch (error) {
      // Error fetching Response
    }
  }

  const onAudioSubtitlesSettingsPressed = () =>{
        activeTabsRef.current = ['audio','captions'];
        setIsUserActive(false);
        handleSidebarOpen(true);
    }

    const onVideoSettingsPressed = () =>{
        activeTabsRef.current = ['video'];
        setIsUserActive(false);
        handleSidebarOpen(true);
    }

  const handleFocusSeekBar = () => {
    setFocus(SEEKBAR_THUMBIAL_STRIP_FOCUSKEY);
    setIsSeekbarVisible(true);
  };

  const handleSidebarOpen  = (val) =>{
    isSideBarOpenRef.current = val;
    setSidebarOpen(val);
  }

  const handleFocusVideoOverlay = () => {
    resetInactivityTimeout();
    // setFocus('settingsBtn');
  };

const resetInactivityTimeout = useCallback(() => {
  setIsUserActive(true);
  clearTimeout(inactivityTimeout.current);
  inactivityTimeout.current = setTimeout(() => {
    const isSeeking = isSeekingRef.current === true; // Treat null/undefined as false
    const isSidebarOpen = isSideBarOpenRef.current === true;

    if (!isSeeking && !isSidebarOpen) {
      setIsUserActive(false);
      setFocus("Dummy_Btn");
    }
  }, inactivityDelay);
}, []);

  const safePlay = async () => {
    handleThumbnialStripVisibility(false);
    try {
      // await videoRef.current?.play();
      handleSetIsPlaying(true);
      startWatchTimer();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Play error:", error);
      }
    } finally {
      setFocus("Dummy_Button");
    }
  };

  const handleSetIsSeeking = (val) => {
    isSeekingRef.current = val;
    if (val) {
      // Clear any pending resumePlay
      clearTimeout(resumePlayTimeoutRef.current);

      // Pause immediately on start of seek
      if (videoRef.current && !videoRef.current.paused) {
        // videoRef.current.pause();
        handleSetIsPlaying(false);
      }
      handleIsSeekbarVisible(true);
    } else {
      // Debounce resume play — wait 300ms after seeking ends
      resumePlayTimeoutRef.current = setTimeout(() => {
        safePlay();
      }, 0);
      setTimeout(() => {
        handleIsSeekbarVisible(false);
      }, 3000);
    }
  };

  const handleIsSeekbarVisible = (val) => {
    isSeekbarVisibleRef.current = val;
    setIsSeekbarVisible(val);
  };

  const handleThumbnialStripVisibility = (val) => {
    isThumbnailStripVisibleRef.current = val;
    setIsThumbnailStripVisible(val);
  };

const skipButtonEnterPress = () => {
  const currentSkipLabel = skipButtonTextRef.current;
  let endTime = null;

  if (!currentSkipLabel || !skipInfo || !showSkipButtonsRef.current) return;

  switch (currentSkipLabel) {
    case SKIP_INTRO_TEXT:
      endTime = skipInfo.skipIntroET;
      break;
    case SKIP_RECAP_TEXT:
      endTime = skipInfo.skipRecapET;
      break;
    case SKIP_NEXT_EPISODE_TEXT:
      // Placeholder for next episode logic (optional navigation handler)
      // endTime = null;  // No seeking for "Next Episode"
      return; // Exit early; no seek needed
    default:
      return; // No matching label, exit early
  }

  if (endTime !== null && !isNaN(endTime) && Number(endTime) > 0) {
    videoRef.current.currentTime = Number(endTime);
  }
};


  const { seekMultiplier, seekDirection } = useSeekHandler(
    videoRef,
    seekInterval,
    handleSetIsSeeking,
    togglePlayPause,
    handleBackPressed,
    handleFocusSeekBar,
    isSideBarOpenRef,
    userActivityRef,
    resetInactivityTimeout,
    isSeekbarVisible,
    isThumbnailStripVisibleRef,
    setIsUserActive,
    isSeekingRef,
    handleFocusVideoOverlay,
    showSkipButtonsRef
  );

  useEffect(() => {
  if (!isSeekingRef.current || !seekDirection || !seekMultiplier) return;

  if(seekMultiplier > 3){
    handleFocusSeekBar();
    return;
  }

  setSeekAmount(seekMultiplier * seekInterval);
  setShowSeekIcon(true);

  clearTimeout(seekIconTimeout.current);
  seekIconTimeout.current = setTimeout(() => {
    if(!isSeekingRef.current){
    setShowSeekIcon(false);
    }
  }, 1000);

  // Cleanup timeout on unmount
  return () => clearTimeout(seekIconTimeout.current);
}, [seekMultiplier, seekDirection, isSeekingRef.current]);

  const initializePlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true); // Start loader while player initializes

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setCaptions([
          { id: -1, label: "Off" },
          ...data.subtitleTracks.map((track) => ({
            id: track.id,
            label: track.name || `Subtitle ${track.id}`,
          })),
        ]);

        setAudioTracks(
          data.audioTracks.map((track) => ({
            id: track.id,
            label: track.name || `Audio ${track.id}`,
          }))
        );

        //video.play();
        if (playDuration && parseInt(playDuration) != 0) {
          video.currentTime = playDuration;
        }
        sendAnalyticsForMedia();
        handleSetIsPlaying(true);
      });

      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
                setSelectedCaption(data.id);
            });

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                setSelectedAudio(data.id);
            });

      video.hls = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      // video.play();
      handleSetIsPlaying(true);
    }
  }, [src]);

useEffect(() => {
  if (videoRef && videoRef.current) {
    const video = videoRef.current;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
    };
    const handleStalled = () => setIsLoading(true);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("stalled", handleStalled);


    if (playCapability == true) {
      setStreamLimitError(false);
      watchTimeRef.current = 0;
      initializePlayer();
    }else if(playCapability == false){
      setStreamLimitError(true)
    }

    // resetInactivityTimeout(); // Uncomment if needed

    return () => {
      video?.hls?.destroy();
      clearTimeout(playIconTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(resumePlayTimeoutRef.current);
      clearInterval(watchTimeIntervalRef.current);
      analyticsHistoryIdRef.current = null;

      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("stalled", handleStalled);
    };
  }
}, [initializePlayer, videoRef, playCapability]);

useEffect(() => {
  const setup = async () => {
    try {
      const response = await connectManuallyV2();
      if (response?.streamCapability) {
        // setIsReadyToPlay(true);
      }
    } catch (err) {
      console.error("Failed to connect manually:", err);
    }
  };

  if (isConnected) {
    setup();
  }

  return () => {
    disconnectManually();
  };
}, [isConnected]);



  useEffect(() => {
    let frameId;
    let lastCheck = 0;
    const THROTTLE_MS = 500; // adjust as needed

    const checkSkipPoints = (timestamp) => {
      if (timestamp - lastCheck >= THROTTLE_MS) {
        const currentTime = videoRef.current?.currentTime || 0;
        let newShowSkipButtons = false;
        let newSkipButtonText = '';

        if (skipInfo?.skipIntroST && currentTime >= skipInfo?.skipIntroST && currentTime <= skipInfo?.skipIntroET) {
          newShowSkipButtons = true;
          newSkipButtonText = 'Skip Intro';
        } else if (skipInfo?.skipRecapST && currentTime >= skipInfo?.skipRecapST && currentTime <= skipInfo?.skipRecapET) {
          newShowSkipButtons = true;
          newSkipButtonText = 'Skip Recap';
        } else if (skipInfo?.nextEpisodeST && currentTime >= skipInfo?.nextEpisodeST) {
          newShowSkipButtons = true;
          newSkipButtonText = 'Next Episode';
        }

        if (newShowSkipButtons !== showSkipButtonsRef.current) {
          setShowSkipButtons(newShowSkipButtons);
          setTimeout(()=>{
          setFocus(SKIP_BTN_FOCUS_KEY);
          },100);
          showSkipButtonsRef.current = newShowSkipButtons;
        }

        if (newSkipButtonText !== skipButtonTextRef.current) {
          setSkipButtonText(newSkipButtonText);
          skipButtonTextRef.current = newSkipButtonText;
        }

        lastCheck = timestamp;
      }

      frameId = requestAnimationFrame(checkSkipPoints);
    };

    frameId = requestAnimationFrame(checkSkipPoints);

    return () => cancelAnimationFrame(frameId);
  }, [skipInfo, videoRef]);


  useEffect(() => {
    userActivityRef.current = isUserActive;
    if (userActivityRef.current) {
    } else {
    }
  }, [isUserActive]);

  if (!src) return <div>Missing video source</div>;

  return (
    <FocusContext.Provider value={currentFocusKey}>
      {streamLimitError && (
      <StreamLimitModal isOpen={true} onClose={handleBackPressed} />
    )}

       <div ref={ref} className="video-container">
        <video ref={videoRef} className="video-player" controls={false} muted />

        <Popup
          onVideoSettingsPressed={onVideoSettingsPressed}
          onAudioSubtitlesSettingsPressed={onAudioSubtitlesSettingsPressed}
          onBackPress={handleBackPressed}
          videoRef={videoRef}
          title={movieTitle}
          focusKey={VIDEO_OVERLAY_FOCUS_KEY}
          isVisible={isUserActive}
          resetInactivityTimeout={resetInactivityTimeout}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
        />

        <VirtualThumbnailStripWithSeekBar
          videoRef={videoRef}
          setIsSeeking={handleSetIsSeeking}
          focusKey={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
          key={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          setIsSeekbarVisible={handleIsSeekbarVisible} // used to get input from component is visible from focus
          isThumbnailStripVisible={isThumbnailStripVisible} // to control thumnail strip
          setIsThumbnailStripVisible={handleThumbnialStripVisibility} // used to get input if thumbnail strip is visible
          isVisible={isUserActive || isSeekbarVisible} // used to make seekbar visible from prent
          watchTimeRef={watchTimeRef}
          setShowSkipButtons={setShowSkipButtons}
          setSkipButtonText={setSkipButtonText}
        />

        {showSeekIcon && (
          <div className="seek-icon">
            {seekDirection === "forward" && (
              <div className="forward">
                <p>{seekAmount}s</p> <MdFastForward />
              </div>
            )}
            {seekDirection === "backward" && (
              <div className="rewind">
                <MdFastRewind /> <p>{seekAmount}s</p>
              </div>
            )}
          </div>
        )}

        {showPlayIcon && (
          <div className={`playPauseRipple ${showPlayIcon ? 'show' : ''}`}>
            {isPlaying ? <MdPlayArrow /> : <MdOutlinePause />}
          </div>
        )}

        {sidebarOpen && (
          <SideBar_Tab
            isOpen={isSideBarOpenRef.current}
            onClose={() => handleSidebarOpen(false)}
            captions={captions}
            selectedCaption={selectedCaption}
            onCaptionSelect={switchCaption}
            qualityLevels={customResolutions}
            selectedQuality={selectedQuality}
            onQualitySelect={handleQualityChange}
            audioTracks={audioTracks}
            selectedAudio={selectedAudio}
            onAudioSelect={handleAudioChange}
            activeTabs={activeTabsRef.current}
          />
        )}

        {showSkipButtons && <FocusableButton
          text={skipButtonText}
          className="skip-button"
          focusClass="skip-button-focused"
          focuskey={SKIP_BTN_FOCUS_KEY}
          onEnterPress={skipButtonEnterPress}
        />}

        {isLoading && (
          <div className="video-loader">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default VideoPlayer;
