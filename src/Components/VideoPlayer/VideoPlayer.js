import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css'; // Custom styles
import SeekBar from './SeekBar';
import { useState } from 'react';
import { FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {

    const location = useLocation();
    const { src } = location.state;

    const customResolutions = [
        { minBandwidth: "auto", maxBandwidth: "auto", resolution: "Auto", label: "Auto" },
        { minBandwidth: 0, maxBandwidth: 1000000, resolution: "960x540", label: "Data Saver" },
        { minBandwidth: 1000001, maxBandwidth: 3000000, resolution: "1280x720", label: "HD" },
        { minBandwidth: 3000001, maxBandwidth: 5000000, resolution: "1920x1080", label: "Full HD" }
    ];

    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isUserActive, setIsUserActive] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // captions
    const [captions, setCaptions] = useState([]); // Store extracted captions
    const [selectedCaption, setSelectedCaption] = useState(null);
    //quality
    const [selectedQuality, setSelectedQuality] = useState(customResolutions[0]); // Default Auto
    //audio
    const [audioTracks, setAudioTracks] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [duration, setDuration] = useState(0); // Add duration state
    const [currentTime,setCurrentTime] = useState(0);



    // using this useRef for SideBar as it is used for handleKEy Down and handleKeyDown is only added
    //  once in useEffect, it captures the initial state of sidebarOpen and does not get updated when 
    // setSidebarOpen changes its value.
    const sidebarOpenRef = useRef(sidebarOpen);
    const seekSpeed = 10; // secs to seek on left or right button
    let seekTimeout = null;

    const togglePlayPause = () => {
        if (playerRef.current.paused()) {
            playerRef.current.play();
            setIsPlaying(true);
        } else {
            playerRef.current.pause();
            setIsPlaying(false);
        }
    };

    const onUserActive = () => {
        console.log('UserActive');
        if (sidebarOpenRef.current) {
            return;
        }
        setIsUserActive(true);
        setFocus('playBtn');
    };

    const onUserInactive = () => {
        if (!isPlaying && !sidebarOpenRef.current) {
            setFocus('playBtn');
            return;
        }

        if (!sidebarOpenRef.current) {
            setIsUserActive(false);
            //Blank_Btn is not Btn this is dummy just to loose focus on user Inactive
            // and does not have focus already when user active if so it will directly play video
            setFocus('Blank_Btn');
            return;
        }
    };

    const seekVideo = (seconds) => {
        const currentTime = playerRef.current.currentTime();
        playerRef.current.currentTime(currentTime + seconds);
    }


    const onSettingsPressed = useCallback(() => {
        playerRef.current.userActive(!sidebarOpenRef.current);
        setSidebarOpen(!sidebarOpenRef.current);
    }, [sidebarOpen]);

    const updateCurrentTime = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleSeek = (newTime) => {
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    useEffect(() => {
        const interval = setInterval(updateCurrentTime, 1000); // Update current time every second
        return () => clearInterval(interval);
    }, []);



    // Handle remote control keys
    const handleKeyDown = (e) => {
        console.log('In Video')
        e.preventDefault();
        e.stopPropagation();

        if (sidebarOpenRef.current) {
            if (e.keyCode == 10009 || e.keyCode == 8) {
                onSettingsPressed();
                return;
            }
        }
        else {
            setIsUserActive(true);
            playerRef.current.userActive(true);

            switch (e.keyCode) {
                case 13: // Enter key
                    // Add Actions here
                    break;
                case 38: // Up
                case 40: // Down
                    // Add Actions Here
                    break;
                case 37: // Left Arrow 
                    seekVideo(-seekSpeed); // Seek backward 10 seconds
                    break;
                case 39:
                    seekVideo(seekSpeed);// Seek forward 10 seconds
                    break;
                case 10009:
                case 8:
                    if (window.history.length > 1) {
                        window.history.back();
                    }
                    else {
                        console.log('No back allowed');
                    }
                    break;
            }
        }
    };

    const initializePlayer = () => {
        playerRef.current = videojs(videoRef.current, {
            controls: true,
            autoPlay: true,
            muted: false,
            preload: 'auto',
            inactivityTimeout: 5000,
            enableSmoothSeeking: true,
            controlBar: {
                playToggle: false, // Disable default play button
                volumePanel: false, // Disable volume control
                fullscreenToggle: false, // Disable fullscreen toggle,
                pictureInPictureToggle: false // disable picture in picture
            },
        });

        if (Hls.isSupported()) {
            console.log('HLS Supported');
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const subtitleTracks = data.subtitleTracks.map(track => ({
                    id: track.id,
                    label: track.name || `Subtitle ${track.id}`
                }));
                setCaptions(subtitleTracks);
                const extractedAudioTracks = data.audioTracks.map(track => ({
                    id: track.id,
                    label: track.name || `Subtitle ${track.id}`
                }));
                setAudioTracks(extractedAudioTracks);

                videoRef.current.play();
            })

            //Listen for caption track changes
            hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
                setSelectedCaption(data.id);
            });

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                setSelectedAudio(data.id);
            });

            playerRef.current.hls = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = src;
            videoRef.current.addEventListener("canplay", () => {
                videoRef.current.play();
            });
        } else {
            console.log("video not supported");
        }

        videoRef.current.addEventListener('loadedmetadata', () => {
            debugger;
            setDuration(videoRef.current.duration);
        });

        playerRef.current.userActive(true);
        setIsUserActive(true);
        setFocus('playBtn');
    }

    useEffect(() => {

        initializePlayer();

        // Cleanup function for component unmount
        return () => {
            if (playerRef.current) {
                // Remove event listeners
                ['mousedown', 'mousemove', 'click', 'mouseenter', 'wheel'].forEach(eventType => {
                    playerRef.current.el().removeEventListener(eventType, () => { });
                });

                playerRef.current.off('ended');
                playerRef.current.off('pause');
                playerRef.current.off('start');

                if (playerRef.current.hls) {
                    playerRef.current.hls.destroy(); // Cleanup HLS instance if it exists
                }

                playerRef.current.dispose(); // Dispose the video.js player instance
            }
        };
    }, [src]);


    useEffect(() => {
        if (!playerRef.current) return;

        // Attach event listeners
        playerRef.current.on("useractive", onUserActive);
        playerRef.current.on("userinactive", onUserInactive);

        // Cleanup to avoid duplicate event bindings
        return () => {
            playerRef.current.off("useractive", onUserActive);
            playerRef.current.off("userinactive", onUserInactive);
        };
    }, [isPlaying, isUserActive, setIsUserActive]); // Depend on isPlaying so it updates


    useEffect(() => {
        const handleKeyDownWrapper = (e) => {
            console.log('ABC');
            e.preventDefault();
            e.stopPropagation(); // Ensure it doesn't propagate to App.js
            handleKeyDown(e);
        };

        window.addEventListener('keydown', handleKeyDownWrapper);
        return () => {
            window.removeEventListener('keydown', handleKeyDownWrapper);
        };
    }, []);

    useEffect(() => {
        sidebarOpenRef.current = sidebarOpen;
        if (sidebarOpenRef.current) {
            playerRef.current.userActive(false);
            setIsUserActive(false);
        }
    }, [sidebarOpen]);

    const switchCaption = (captionId) => {
        if (playerRef.current.hls) {
            playerRef.current.hls.subtitleTrack = captionId;
            setSelectedCaption(captionId);
        }
    };

    const handleQualityChange = (quality) => {
        if (playerRef.current.hls) {
            if (quality.minBandwidth === "auto") {
                playerRef.current.hls.currentLevel = -1; // Auto quality
            } else {
                const level = playerRef.current.hls.levels.findIndex(
                    (lvl) => lvl.bitrate >= quality.minBandwidth && lvl.bitrate <= quality.maxBandwidth
                );
                if (level !== -1) {
                    playerRef.current.hls.currentLevel = level;
                }
            }
        }
        setSelectedQuality(quality.label);
    };

    const handleAudioChange = (audioId) => {
        if (playerRef.current.hls) {
            playerRef.current.hls.audioTrack = audioId;
            setSelectedAudio(audioId);
        }
    };

    return (
        <div className='video-container'>
            <div data-vjs-player style={{ position: 'relative' }}>
                <video ref={videoRef}
                    className="video-js"
                >
                </video>
                <div
                    className={`icon-overlay ${isUserActive ? 'show' : 'hide'}`}
                    onClick={(e) => { e.stopPropagation() }}>
                    <FocusContext.Provider value="video-overlay">
                        <Popup
                            onSettingsPressed={onSettingsPressed}
                            onPlayClick={togglePlayPause}
                            isPlaying={isPlaying}
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={handleSeek} />
                    </FocusContext.Provider>
                </div>



                <SideBar_Tab
                    isOpen={sidebarOpen}
                    onClose={onSettingsPressed}
                    captions={captions}
                    selectedCaption={selectedCaption}
                    onCaptionSelect={switchCaption}
                    qualityLevels={customResolutions}
                    selectedQuality={selectedQuality}
                    onQualitySelect={handleQualityChange}
                    audioTracks={audioTracks}
                    onAudioSelect={handleAudioChange}
                    selectedAudio={selectedAudio}
                />
            </div>
        </div>
    )
}

export default VideoPlayer;