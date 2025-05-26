import React, { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import "./index.css";
import {
  FocusContext,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import Popup from "./Popup";
import SideBar_Tab from "./SideBar_Tab";
import { useLocation } from "react-router-dom";
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

const SEEKBAR_THUMBIAL_STRIP_FOCUSKEY = "PREVIEW_THUMBNAIL_STRIP";
const VIDEO_PLAYER_FOCUS_KEY = "VIDEO_PLAYER";
const VIDEO_OVERLAY_FOCUS_KEY = "VIDEO_OVERLAY";

const VideoPlayer = () => {
  const location = useLocation();
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
  const isPlayingRef = useRef();

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekAmount, setSeekAmount] = useState(10);
  const [isSeekbarVisible, setIsSeekbarVisible] = useState(false);
  const [isThumbnailStripVisible, setIsThumbnailStripVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const userActivityRef = useRef(null);
  const isSeekingRef = useRef(null);
  const isSeekbarVisibleRef = useRef(null);
  const isThumbnailStripVisibleRef = useRef(null);
  const resumePlayTimeoutRef = useRef(null);
  let inactivityDelay = 5000;
  const seekInterval = 10;
  const analyticsHistoryIdRef  = useRef();

  // REFS TO MANTAIN PLAY TIME FOR ANALYTICS
  const watchTimeRef = useRef(0); // Total watch time in seconds
  const watchTimeIntervalRef = useRef(null);


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
    if (window.history.length > 1) {
      window.history.back();
    }
  }, []);

  const handleSetAnalyticsHistoryId = (historyId) =>{
    analyticsHistoryIdRef.current = historyId;
  }

  const sendAnalyticsForMedia = async () => {
    try{
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
    if(VideoAnalyticsRes && VideoAnalyticsRes.isSuccess){
      if(!analyticsHistoryIdRef.current){
        handleSetAnalyticsHistoryId(VideoAnalyticsRes.data)
      }else{
        // History Id already set and just need to update data on historyId
      }
    }else{
      //Error fetching response
      console.log('Error fetching Response of Video Analytics : result not found');
    }
  }catch(error){
    // Error fetching Response
    console.log('Error fetching Response of Video Analytics : Exception in block');
  }
  }

  const handleFocusSeekBar = () => {
    setFocus(SEEKBAR_THUMBIAL_STRIP_FOCUSKEY);
    setIsSeekbarVisible(true);
  };

  const handleFocusVideoOverlay = () => {
    resetInactivityTimeout();
    // setFocus('settingsBtn');
  };

  const resetInactivityTimeout = useCallback(() => {
    setIsUserActive(true);
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      if (!isSeekingRef.current) {
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
    setIsUserActive,
    isSeekingRef,
    handleFocusVideoOverlay
  );

  useEffect(() => {
    const showSeekIcons = (direction) => {
      if (direction && direction != null) {
        setSeekAmount(seekMultiplier * seekInterval);
        setShowSeekIcon(true);

        clearTimeout(seekIconTimeout.current);
        seekIconTimeout.current = setTimeout(
          () => setShowSeekIcon(false),
          1000
        );
      } else {
        setShowSeekIcon(false);
      }
    };

    if (seekMultiplier && seekMultiplier > 0 && isSeekingRef.current) {
      showSeekIcons(seekDirection);
    }
  }, [seekMultiplier]);

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
        if(playDuration && parseInt(playDuration) != 0){
          video.currentTime = playDuration;
        }
        sendAnalyticsForMedia();
        handleSetIsPlaying(true);
      });

      video.hls = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      // video.play();
      handleSetIsPlaying(true);
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    // video?.addEventListener('ended', () => {console.log('ended')});
    video.addEventListener("waiting", () => setIsLoading(true));
    video.addEventListener("canplay", () => setIsLoading(false));
    video.addEventListener("playing", () => {
      setIsLoading(false);
      console.log('Watch time (s):', watchTimeRef.current);
    });
    video.addEventListener("stalled", () => setIsLoading(true)); // Fallback

    initializePlayer();
    // resetInactivityTimeout();

    return () => {
      video?.hls?.destroy();
      clearTimeout(playIconTimeout.current);
      clearTimeout(inactivityTimeout.current);
      clearTimeout(resumePlayTimeoutRef.current);
      clearInterval(watchTimeIntervalRef.current);
      analyticsHistoryIdRef.current = null;
      video?.removeEventListener("waiting", () => setIsLoading(true));
      video?.removeEventListener("canplay", () => setIsLoading(false));
      video?.removeEventListener("playing", () => setIsLoading(false));
      video?.removeEventListener("stalled", () => setIsLoading(true));
    };
  }, [initializePlayer]);

  useEffect(() => {
    userActivityRef.current = isUserActive;
    if (userActivityRef.current) {
    } else {
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
        />

        {showSeekIcon && (
          <div className="seek-icon">
            {seekDirection === "forward" && (
              <div className="forward">
                <p>{seekAmount}s</p> <MdFastForward />
              </div>
            )}
            {seekDirection === "reverse" && (
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
