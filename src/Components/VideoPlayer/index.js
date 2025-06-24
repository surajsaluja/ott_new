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
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import VirtualThumbnailStripWithSeekBar from "../VirtualList/VirtualThumbnailStripWithSeekBar";
import useSeekHandler from "./useSeekHandler";
import { getDeviceInfo } from "../../Utils";
import { useUserContext } from "../../Context/userContext";
import { sendVideoAnalytics } from "../../Service/MediaService";
import { useSignalR } from "../../Hooks/useSignalR";
import StreamLimitModal from "./StreamLimitError";
import useOverrideBackHandler from "../../Hooks/useOverrideBackHandler";
import Spinner from "../Common/Spinner";
import { FaForward, FaPause, FaPlay } from "react-icons/fa6";

const SEEKBAR_THUMBIAL_STRIP_FOCUSKEY = "PREVIEW_THUMBNAIL_STRIP";
const THUMBNAIL_STRIP_FOCUSKEY = "STRIP_THUMBNAIL";
const VIDEO_PLAYER_FOCUS_KEY = "VIDEO_PLAYER";
const VIDEO_OVERLAY_FOCUS_KEY = "VIDEO_OVERLAY";
const SKIP_BTN_FOCUS_KEY = "SKIP_BUTTON";
const SKIP_INTRO_TEXT = "Skip Intro";
const SKIP_RECAP_TEXT = "Skip Recap";
const SKIP_NEXT_EPISODE_TEXT = "Next Episode";
const DUMMY_BTN_FOCUS_KEY = "DUMMY_BUTTON";

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
    playDuration,
  } = location.state || {};
  const deviceInfo = getDeviceInfo();
  const { userObjectId } = useUserContext();
  const videoRef = useRef(null);
  const playIconTimeoutRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);
  const seekIconTimeoutRef = useRef(null);
  const isSideBarOpenRef = useRef();

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekAmount, setSeekAmount] = useState(10);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isSeekbarVisible, setIsSeekbarVisible] = useState(false);
  const [isThumbnailStripVisible, setIsThumbnailStripVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamLimitError, setStreamLimitError] = useState(false);

  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const [showSkipButtons, setShowSkipButtons] = useState(false);
  const [skipButtonText, setSkipButtonText] = useState("");
  const showSkipButtonsRef = useRef(false);
  const skipButtonTextRef = useRef("");

  const userActivityRef = useRef(null);
  const isSeekingRef = useRef(null);
  const isSeekbarVisibleRef = useRef(null);
  const isThumbnailStripVisibleRef = useRef(null);
  const resumePlayTimeoutRef = useRef(null);
  let inactivityDelay = 5000;
  const seekInterval = 10;
  const analyticsHistoryIdRef = useRef();
  const activeTabsRef = useRef(null);
  const isPlayingRef = useRef(null);
  const virtualSeekTimeRef = useRef(null);

  // REFS TO MANTAIN PLAY TIME FOR ANALYTICS
  const watchTimeRef = useRef(0); // Total watch time in seconds
  const watchTimeIntervalRef = useRef(null);

  // SignalR
  const { isConnected, playCapability, connectManuallyV2, disconnectManually } =
    useSignalR();

  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey: VIDEO_PLAYER_FOCUS_KEY,
    trackChildren: true,
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
      if (
        !isSeekingRef.current &&
        videoRef?.current &&
        !videoRef?.current.paused
      ) {
        watchTimeRef.current += 1;
      }
    }, 1000);
  };

  const stopWatchTimer = () => {
    clearInterval(watchTimeIntervalRef.current);
    watchTimeIntervalRef.current = null;
  };

  const handleSetIsPlaying = async (val) => {
    let video = videoRef.current;
    if (!video) return;

    if (val === !!isPlayingRef.current) return;

    try {
      if (val && video.paused) {
        startWatchTimer();
        await video.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
      } else if (!val && (!video.paused || video.ended)) {
        stopWatchTimer();
        await video.pause();
        isPlayingRef.current = false;
        setIsPlaying(false);
        sendAnalyticsForMedia();
      }
    } catch (error) {
      console.error("Error in handleSetIsPlaying:", error);
    }
  };

  // const THUMBNAIL_BASE_URL = 'https://images.kableone.com/Images/MovieThumbnails/Snowman/thumbnail';
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      // videoRef.current.play();
      handleSetIsPlaying(true);
    } else {
      // videoRef.current.pause();
      handleSetIsPlaying(false);
    }
    setShowPlayIcon(true);
    clearTimeout(playIconTimeoutRef.current);
    playIconTimeoutRef.current = setTimeout(() => setShowPlayIcon(false), 700);
  }, []);

  const handleSetIsUserActive = (val) => {
  // Only update if value has changed

  if (val === true) {
    // Focus the thumbnail strip only if user was previously inactive
    if (userActivityRef.current !== true && isSeekingRef.current != true && isSideBarOpenRef.current != true) {
      setFocus(SEEKBAR_THUMBIAL_STRIP_FOCUSKEY);
    }

    // Clear previous timeout if any
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Start inactivity timer
    inactivityTimeoutRef.current = setTimeout(() => {
      if (isThumbnailStripVisibleRef.current || isSideBarOpenRef.current) {
        return;
      }
      handleSetIsUserActive(false);
    }, inactivityDelay);
  }

  if (val === false) {
    setFocus(DUMMY_BTN_FOCUS_KEY);
    handleThumbnialStripVisibility(false);
  }

  if (userActivityRef.current !== val) {
    userActivityRef.current = val;
    setIsUserActive(val);
  }
};

useOverrideBackHandler(() => {
    handleBackPressed();
  });


  const handleBackPressed = useCallback(() => {
  if(isThumbnailStripVisibleRef.current){
    handleThumbnialStripVisibility(false);
    return;
  }else if (isSideBarOpenRef.current) {
      handleSidebarOpen(false);
      handleSetIsUserActive(false);
      // setFocus('Dummy_Btn');
      return;
    }else if (userActivityRef.current) {
      handleSetIsUserActive(false);
      return;
    }  else if (isSeekbarVisibleRef.current) {
      return;
    } else {
      history.goBack();
      return;
    }
  }, [isSideBarOpenRef, userActivityRef]);

  const handleBackButtonPressed = () =>{
    history.goBack();
  }

  const handleSetAnalyticsHistoryId = (historyId) => {
    analyticsHistoryIdRef.current = historyId;
  };

  const switchCaption = (caption) => {
    if (videoRef.current.hls) {
      videoRef.current.hls.subtitleTrack = caption.id === -1 ? -1 : caption.id;
      setSelectedCaption(caption.id);
    }
  };

  const handleQualityChange = (quality) => {
    if (videoRef.current.hls) {
      if (quality.minBandwidth === "auto") {
        videoRef.current.hls.currentLevel = -1; // Auto quality
      } else {
        const level = videoRef.current.hls.levels.findIndex(
          (lvl) =>
            lvl.bitrate >= quality.minBandwidth &&
            lvl.bitrate <= quality.maxBandwidth
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
      const currentPosition = videoRef?.current
        ? videoRef?.current.currentTime
        : 0;

      if (analyticsHistoryIdRef.current) {
        analyticsData = {
          mediaId: mediaId,
          userId: userObjectId,
          deviceId: deviceInfo.deviceId,
          userAgent: "Tizen",
          playDuration: playDuration.toString(),
          CurrentPosition: parseInt(currentPosition).toString(),
          status: "Pause",
          action: "AppNew",
          historyid: analyticsHistoryIdRef.current,
          DeviceType: 5,
          DeviceName: deviceInfo.deviceName,
          IsTrailer: isTrailer,
        };
      } else {
        analyticsData = {
          mediaId: mediaId,
          userId: userObjectId,
          deviceId: deviceInfo.deviceId,
          userAgent: "Tizen",
          playDuration: playDuration.toString(),
          CurrentPosition: currentPosition.toString(),
          status: "BrowserEvent",
          action: "AppNew",
          DeviceType: 5,
          DeviceName: deviceInfo.deviceName,
          IsTrailer: isTrailer,
        };
      }

      const VideoAnalyticsRes = await sendVideoAnalytics(analyticsData);
      if (VideoAnalyticsRes && VideoAnalyticsRes.isSuccess) {
        if (!analyticsHistoryIdRef.current) {
          handleSetAnalyticsHistoryId(VideoAnalyticsRes.data);
        } else {
          // History Id already set and just need to update data on historyId
        }
      } else {
        //Error fetching response
      }
    } catch (error) {
      // Error fetching Response
    }
  };

  const onAudioSubtitlesSettingsPressed = () => {
    activeTabsRef.current = ["audio", "captions"];
    handleSetIsUserActive(false);
    handleSidebarOpen(true);
  };

  const onVideoSettingsPressed = () => {
    activeTabsRef.current = ["video"];
    handleSetIsUserActive(false);
    handleSidebarOpen(true);
  };

  const handleSidebarOpen = (val) => {
    isSideBarOpenRef.current = val;
    setSidebarOpen(val);
  };

  const handleFocusVideoOverlay = () => {
    handleSetIsUserActive(true);
  };

  const handleSetIsSeeking = (val) => {
    if (val === isSeekingRef.current) return;
    isSeekingRef.current = val;
    if (val === true) {
      handleSetIsPlaying(false);
      setIsSeeking(true);
    } else if (val === false) {
      clearSeek();
      setIsSeeking(false);
      handleSetIsPlaying(true);
    }
  };

  const handleThumbnialStripVisibility = (val) => {
    if (val === isThumbnailStripVisibleRef.current) return;
    setIsThumbnailStripVisible(val);
    isThumbnailStripVisibleRef.current = val;
    if (val === true) {
      handleSetIsUserActive(true);
    }
    if(val === false){
      virtualSeekTimeRef.current = null;
      handleSetIsSeeking(false);
    }
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
        return;
      default:
        return;
    }

    if (endTime !== null && !isNaN(endTime) && Number(endTime) > 0) {
      videoRef.current.currentTime = Number(endTime);
      setShowSkipButtons(false);
      handleSetIsUserActive(true);
    }
  };

  const handleFocusSeekBar = () => {
    if (isSeekingRef.current && THUMBNAIL_BASE_URL != null) {
      setFocus(THUMBNAIL_STRIP_FOCUSKEY);
      handleThumbnialStripVisibility(true);
    } else {
      setFocus(SEEKBAR_THUMBIAL_STRIP_FOCUSKEY);
    }
    handleSetIsUserActive(true);
  };

  const { seekMultiplier, seekDirection, clearSeek, resetMultiplier } = useSeekHandler(
    videoRef,
    seekInterval,
    handleSetIsSeeking,
    togglePlayPause,
    handleBackPressed,
    handleFocusSeekBar,
    isSideBarOpenRef,
    userActivityRef,
    isSeekbarVisible,
    isThumbnailStripVisibleRef,
    handleSetIsUserActive,
    isSeekingRef,
    handleFocusVideoOverlay,
    showSkipButtonsRef
  );

  useEffect(() => {
    if (
      !isSeekingRef.current ||
      !seekDirection ||
      !seekMultiplier ||
      isSeekbarVisible
    )
      return;

    if (seekMultiplier == 4 && isThumbnailStripVisibleRef.current != true) {
      resetMultiplier();
      clearSeek();
      setShowSeekIcon(false);
      setTimeout(() => {
        handleFocusSeekBar();
      }, 100);
      return;
    }

    setSeekAmount(seekMultiplier * seekInterval);
    setShowSeekIcon(true);

    clearTimeout(seekIconTimeoutRef.current);
    seekIconTimeoutRef.current = setTimeout(() => {
      if (!isSeekingRef.current) {
        setShowSeekIcon(false);
      }
    }, 500);

    // Cleanup timeout on unmount
    return () => clearTimeout(seekIconTimeoutRef.current);
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

      const handleWaiting = () => {
        setIsLoading(true);
      };
      const handleCanPlay = () => {
        setIsLoading(false);
      };
      const handlePlaying = () => {
        setIsLoading(false);
      };
      const handleStalled = () => {
        setIsLoading(true);
      };

      const handleEnded = () =>{
        handleSetIsPlaying(false);
        video.currentTime = 0;
      }

      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("stalled", handleStalled);
      video.addEventListener("ended",handleEnded);

      if (playCapability == true) {
        setStreamLimitError(false);
        watchTimeRef.current = 0;
        initializePlayer();
      } else if (playCapability == false) {
        setStreamLimitError(true);
      }

      return () => {
        video?.hls?.destroy();
        clearTimeout(playIconTimeoutRef.current);
        clearTimeout(inactivityTimeoutRef.current);
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
        let newSkipButtonText = "";

        if (isSeeking == null || isSeeking === false) {
          if (
            skipInfo?.skipIntroST &&
            currentTime >= skipInfo?.skipIntroST &&
            currentTime <= skipInfo?.skipIntroET
          ) {
            newShowSkipButtons = true;
            newSkipButtonText = "Skip Intro";
          } else if (
            skipInfo?.skipRecapST &&
            currentTime >= skipInfo?.skipRecapST &&
            currentTime <= skipInfo?.skipRecapET
          ) {
            newShowSkipButtons = true;
            newSkipButtonText = "Skip Recap";
          } else if (
            skipInfo?.nextEpisodeST &&
            currentTime >= skipInfo?.nextEpisodeST
          ) {
            newShowSkipButtons = true;
            newSkipButtonText = "Next Episode";
          }
        } else if (isSeeking === true) {
          newShowSkipButtons = false;
        }

        if (newShowSkipButtons !== showSkipButtonsRef.current) {
          setShowSkipButtons(newShowSkipButtons);
          showSkipButtonsRef.current = newShowSkipButtons;
          if(isSideBarOpenRef.current != true){
          handleSetIsUserActive(true);
          }
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
  }, [skipInfo, videoRef, isSeeking]);

  // useEffect(() => {
  //   userActivityRef.current = isUserActive;
  //   if (userActivityRef.current) {
  //   } else {
  //   }
  // }, [isUserActive]);

  if (!src) return <div>Missing video source</div>;

  return (
    <FocusContext.Provider value={currentFocusKey}>
      {streamLimitError && (
        <StreamLimitModal isOpen={true} onClose={handleBackPressed} />
      )}

      <div ref={ref} className="video-container">
        <video ref={videoRef} className="video-player" controls={false}/>

        <Popup
          onVideoSettingsPressed={onVideoSettingsPressed}
          onAudioSubtitlesSettingsPressed={onAudioSubtitlesSettingsPressed}
          onBackPress={handleBackPressed}
          videoRef={videoRef}
          title={movieTitle}
          focusKey={VIDEO_OVERLAY_FOCUS_KEY}
          isVisible={isUserActive}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
          handleBackButtonPressed= {handleBackButtonPressed}
          isAudioSubtitlesSettingsAvailable = {true}
          isVideoSettingsAvailable = {true}
        />

        <VirtualThumbnailStripWithSeekBar
          videoRef={videoRef}
          setIsSeeking={handleSetIsSeeking}
          focusKey={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          thumbnailBaseUrl={THUMBNAIL_BASE_URL}
          key={SEEKBAR_THUMBIAL_STRIP_FOCUSKEY}
          isThumbnailStripVisible={isThumbnailStripVisible} // to control thumnail strip
          handleThumbnialStripVisibility={handleThumbnialStripVisibility} // used to get input if thumbnail strip is visible
          isVisible={isUserActive} // used to make seekbar visible from prent
          watchTimeRef={watchTimeRef}
          isSeeking={isSeekingRef.current}
          setShowSkipButtons={setShowSkipButtons}
          setSkipButtonText={setSkipButtonText}
          handleSetIsPlaying={handleSetIsPlaying}
          togglePlayPause={togglePlayPause}
          virtualSeekTimeRef={virtualSeekTimeRef}
          showSkipButtons={showSkipButtons}
          skipButtonText={skipButtonText}
          skipButtonEnterPress={skipButtonEnterPress}
          skipButtonFocusKey={SKIP_BTN_FOCUS_KEY}
        />

        {showSeekIcon && (
          <div className="seek-icon">
            {seekDirection === "forward" && (
              <div className="forward animate-slide-right">
                <p>{seekAmount}s</p> <span><FaForward /></span>
              </div>
            )}
            {seekDirection === "backward" && (
              <div className="rewind animate-slide-left">
                <span><i><FaForward/></i></span> <p>{seekAmount}s</p>
              </div>
            )}
          </div>
         )}

        {showPlayIcon && (
          <div className={`playPauseRipple ${showPlayIcon ? "show" : ""}`}>
            {isPlaying ? <FaPlay /> : <FaPause />}
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


        {isLoading && !isSeeking && (
          <div className="video-loader">
            <Spinner />
          </div>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default VideoPlayer;
