import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSignalR } from '../../../Hooks/useSignalR';
import { DecryptAESString } from '../../../Utils/MediaUtils';
import Hls from "hls.js";
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import StreamLimitModal from '../../VideoPlayer/StreamLimitError';
import Popup from '../../VideoPlayer/Popup';
import SideBar_Tab from '../../VideoPlayer/SideBar_Tab';
import { useHistory, useLocation } from 'react-router-dom';
import Spinner from '../../Common/Spinner';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { CACHE_KEYS, SCREEN_KEYS, setCache } from '../../../Utils/DataCache';
import { useUserContext } from '../../../Context/userContext';
import { saveLiveTvChannelProgress } from '../../../Service/LiveTVService';
import { useBackArrayContext } from '../../../Context/backArrayContext';

const LIVE_TV_PLAYER_FOCUSKEY = 'LIVE_TV_FOCUSKEY'
const VIDEO_OVERLAY_FOCUS_KEY = 'VIDEO_OVERLAY_FOCUSKEY'
const DUMMY_BTN_FOCUS_KEY = "DUMMY_BUTTON";

function LiveTvPlayer() {

    const videoRef = useRef(null);
    const activeTabsRef = useRef(null);
    const isPlayingRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);
    const playIconTimeoutRef = useRef(null);
    const userActivityRef = useRef(null);
    const isSideBarOpenRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [streamLimitError, setStreamLimitError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayIcon, setShowPlayIcon] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isUserActive, setIsUserActive] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState(-1);
    const channelPlayStartTimeRef =  useRef(null);

    let inactivityDelay = 5000;

    const history = useHistory();
    const location = useLocation();
    const { src, title: movieTitle, channelId } = location.state || {};

      const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();
    


    // SignalR
    const { isConnected, playCapability, connectManuallyV2, disconnectManually } =
        useSignalR();

    const { ref, focusKey: currentFocusKey } = useFocusable({
        focusKey: LIVE_TV_PLAYER_FOCUSKEY,
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

    const saveChannelProgress = async() =>{
        try{
            const channelPlayEndTime  = new Date();
            const res = await saveLiveTvChannelProgress(channelPlayStartTimeRef.current, channelPlayEndTime, channelId);
            if(res && res.isSuccess){
                console.log('Session Saved Suucessfully');
            }
            else{
                throw new Error(res.message || res);
            }
        }catch(err){
            console.log(err.message || err);
        }
    }

    const handleSetIsPlaying = async (val) => {
        let video = videoRef.current;
        if (!video) return;

        if (val === !!isPlayingRef.current) return;

        try {
            if (val && video.paused) {
                // startWatchTimer();
                await video.play();
                isPlayingRef.current = true;
                setIsPlaying(true);
                channelPlayStartTimeRef.current = new Date();
            } else if (!val && !video.paused) {
                // stopWatchTimer();
                await video.pause();
                isPlayingRef.current = false;
                setIsPlaying(false);
                saveChannelProgress();
            }
        } catch (error) {
            console.error("Error in handleSetIsPlaying:", error);
        }
    };

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
        clearTimeout(playIconTimeoutRef.current);
        playIconTimeoutRef.current = setTimeout(() => setShowPlayIcon(false), 700);
    }, []);

    const handleBackButtonPressed = () => {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
    }

    const handleBackPressed = useCallback(async() => {
        if (isSideBarOpenRef.current) {
            handleSidebarOpen(false);
            handleSetIsUserActive(false);
            return;
        } else if (userActivityRef.current) {
            handleSetIsUserActive(false);
            return;
        } else {
           await handleSetIsPlaying(false);
            handleBackButtonPressed();
            return;
        }
    }, [isSideBarOpenRef, userActivityRef]);

     useEffect(() => {
    setBackArray(SCREEN_KEYS.PLAYER.LIVE_TV_PLAYER_PAGE, true);
  }, []);

  useEffect(() => {
     if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.PLAYER.LIVE_TV_PLAYER_PAGE) {
        handleBackPressed();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

    

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


    const onVideoSettingsPressed = () => {
        activeTabsRef.current = ["video"];
        handleSetIsUserActive(false);
        handleSidebarOpen(true);
    };

    const handleSidebarOpen = (val) => {
        isSideBarOpenRef.current = val;
        setSidebarOpen(val);
        handleSetIsUserActive(false);

    };

    const handleFocusVideoOverlay = () => {
        handleSetIsUserActive(true);
        setFocus("settingsBtn");
    };

    const handleSetIsUserActive = (val) => {
        // Only update if value has changed

        if (val === true) {

            // Clear previous timeout if any
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
            }

            // Start inactivity timer
            inactivityTimeoutRef.current = setTimeout(() => {
                handleSetIsUserActive(false);
            }, inactivityDelay);
        }

        if (val === false) {
            if (isSideBarOpenRef.current) return;
            setFocus(DUMMY_BTN_FOCUS_KEY);
        }

        if (userActivityRef.current !== val) {
            userActivityRef.current = val;
            setIsUserActive(val);
        }
    };


    const initializePlayer = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        setIsLoading(true); // Start loader while player initializes

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);

            // sendAnalyticsForMedia();
            handleSetIsPlaying(true);

            video.hls = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            // video.play();
            handleSetIsPlaying(true);
        }
    }, [src]);

    useEffect(() => {
        setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.PLAYER.LIVE_TV_PLAYER_PAGE);
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

            const handlePlayerOnline = () => {
                handleSetIsPlaying(true);
            }

            const handlePlayerOffline = () => {
                handleSetIsPlaying(false);
            }

            const handlePlayerVisibilityChange = () => {
                console.log(document.hidden);
                if (document.hidden) {
                    handleSetIsPlaying(false);
                    console.log('video paused');
                } else {
                    handleSetIsPlaying(true);
                    console.log('video played');
                }
            }

            video.addEventListener("waiting", handleWaiting);
            video.addEventListener("canplay", handleCanPlay);
            video.addEventListener("playing", handlePlaying);
            video.addEventListener("stalled", handleStalled);
            window.addEventListener('online', handlePlayerOnline);
            window.addEventListener('offline', handlePlayerOffline);
            window.addEventListener('visibilitychange', handlePlayerVisibilityChange)

            if (playCapability == true) {
                setStreamLimitError(false);
                // watchTimeRef.current = 0;
                initializePlayer();
            } else if (playCapability == false) {
                setStreamLimitError(true);
            }

            return () => {
                video?.hls?.destroy();
                clearTimeout(playIconTimeoutRef.current);
                clearTimeout(inactivityTimeoutRef.current);
                // clearInterval(watchTimeIntervalRef.current);
                // analyticsHistoryIdRef.current = null;

                video.removeEventListener("waiting", handleWaiting);
                video.removeEventListener("canplay", handleCanPlay);
                video.removeEventListener("playing", handlePlaying);
                video.removeEventListener("stalled", handleStalled);
                window.removeEventListener('online', handlePlayerOnline);
                window.removeEventListener('offline', handlePlayerOffline);
                window.removeEventListener('visibilitychange', handlePlayerVisibilityChange)

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

    const handleKeyDown = (e) => {
        if (isSideBarOpenRef.current) {
            return;
        }

        if (userActivityRef.current) {
            handleSetIsUserActive(true);
            return false;
        }

        if (e.keyCode == 13) {
            togglePlayPause();
        } else {
            handleFocusVideoOverlay();
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);



    return (
        <FocusContext.Provider value={currentFocusKey}>
            {streamLimitError && (
                <StreamLimitModal isOpen={true} onClose={handleBackPressed} />
            )}

            <div ref={ref} className="video-container">
                <video ref={videoRef} className="video-player" controls={false} />

                <Popup
                    onVideoSettingsPressed={onVideoSettingsPressed}
                    onAudioSubtitlesSettingsPressed={() => { }}
                    onBackPress={handleBackPressed}
                    videoRef={videoRef}
                    title={movieTitle}
                    focusKey={VIDEO_OVERLAY_FOCUS_KEY}
                    isVisible={isUserActive}
                    thumbnailBaseUrl={null}
                    handleBackButtonPressed={handleBackButtonPressed}
                    isAudioSubtitlesSettingsAvailable={false}
                    isVideoSettingsAvailable={true}
                />

                {showPlayIcon && (
                    <div className={`playPauseRipple ${showPlayIcon ? "show" : ""}`}>
                        {isPlaying ? <FaPlay /> : <FaPause />}
                    </div>
                )}

                {sidebarOpen && (
                    <SideBar_Tab
                        isOpen={isSideBarOpenRef.current}
                        onClose={() => handleSidebarOpen(false)}
                        qualityLevels={customResolutions}
                        selectedQuality={selectedQuality}
                        onQualitySelect={handleQualityChange}
                        activeTabs={activeTabsRef.current}
                    />
                )}


                {isLoading && <Spinner />}
            </div>
        </FocusContext.Provider>
    );
}

export default LiveTvPlayer