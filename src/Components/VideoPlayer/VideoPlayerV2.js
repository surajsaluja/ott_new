import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css'; // Custom styles
import { setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';
import { MdFastForward, MdFastRewind, MdOutlinePause, MdPlayArrow} from 'react-icons/md';

const VideoPlayer = () => {
    
    const location = {};
    location.state = {
        src: 'https://freedomtv.s3.ap-south-1.amazonaws.com/testing/trick1/ea81d788-2590-4ea2-ba67-cbbc9aa10ad7.m3u8',
        movieTitle : 'Sample Multi Subtitle'
    }

    //const location = useLocation();
    const { src, title: movieTitle } = location.state;
    

    const customResolutions = [
        { minBandwidth: 'auto', maxBandwidth: 'auto', resolution: 'Auto', label: 'Auto', id:-1 },
        { minBandwidth: 0, maxBandwidth: 1000000, resolution: '960x540', label: 'Data Saver', id: 1 },
        { minBandwidth: 1000001, maxBandwidth: 3000000, resolution: '1280x720', label: 'HD', id: 2 },
        { minBandwidth: 3000001, maxBandwidth: 5000000, resolution: '1920x1080', label: 'Full HD', id: 3 },
    ];

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const[showPlayIcon,setShowPlayIcon] = useState(false);
    const playIconTimeout = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // captions
    const [captions, setCaptions] = useState([]);
    const [selectedCaption, setSelectedCaption] = useState(-1);
    // quality
    const [selectedQuality, setSelectedQuality] = useState(customResolutions[0].id);
    // audio
    const [audioTracks, setAudioTracks] = useState(-1);
    const [selectedAudio, setSelectedAudio] = useState(null);

    const [isUserActive, setIsUserActive] = useState(true);
    const userActivityRef = useRef(null);
    const inactivityTimeout = useRef(null);
    const sidebarOpenRef = useRef(sidebarOpen);

    const [showSeekIcon, setShowSeekIcon] = useState(false);
    const [seekDirection, setSeekDirection] = useState(null); // "forward" or "backward"
    const seekIconTimeout = useRef(null);
    const seekSpeed = 10;
    const seekInterval = 200; // Interval time in milliseconds (for long press)
    const isSeekingRef = useRef(false);
    const seekIntervalRef = useRef(null);
    const activeTabsRef = useRef(null);

    const togglePlayPause = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }

        setShowPlayIcon(true);

        if(playIconTimeout.current){
            clearTimeout(playIconTimeout.current);
        }

        playIconTimeout.current = setTimeout(()=>{
            setShowPlayIcon(false);
        },700);
    };

    const seekVideo = useCallback((seconds, direction) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setSeekDirection(direction);
            setShowSeekIcon(true);
            
            if(seekIconTimeout.current) 
                clearTimeout(seekIconTimeout.current);
            seekIconTimeout.current = setTimeout(() => setShowSeekIcon(false), 700);
        }
    }, []);

    
    

    const handleBackPressed = () =>{
        if(videoRef.current){
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        if (window.history.length > 1) {
            window.history.back();
        } 
    }

    const onAudioSubtitlesSettingsPressed = () =>{
        activeTabsRef.current = ['audio','captions'];
        setIsUserActive(false);
        onSettingsPressed();
    }

    const onVideoSettingsPressed = () =>{
        activeTabsRef.current = ['video'];
        setIsUserActive(false);
        onSettingsPressed();
    }

    const onSettingsPressed = useCallback(() => {
        sidebarOpenRef.current = !sidebarOpenRef.current;
        setSidebarOpen(sidebarOpenRef.current);
    }, [sidebarOpen]);

    

    const handleKeyDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (sidebarOpenRef.current) {
            if (e.keyCode === 10009 || e.keyCode === 8) {
                onSettingsPressed();
            }
            return;
        } else if (userActivityRef.current) {
            switch (e.keyCode) {
                case 13: 
                    togglePlayPause();
                    resetInactivityTimeout();
                    break;
                case 10009:
                case 8:
                    setIsUserActive(false);
                    break;
                default:
                    resetInactivityTimeout();
                    break;
            }
            
            return;
        }
        else {
            switch (e.keyCode) {
                case 13:
                    togglePlayPause();
                    break;
                case 40: // down
                    resetInactivityTimeout();
                    break;
                case 38: // up
                    resetInactivityTimeout();
                    break;
                case 37: // left
                    seekVideo(-seekSpeed,'backward') // Seek backward 10 seconds
                    break;
                case 39: // right 
                    seekVideo(seekSpeed, 'forward') // Seek forward 10 seconds
                    break;
                case 10009: // back
                case 8:
                    handleBackPressed();
                    break;
            }
        }
    };

    const resetInactivityTimeout = () => {
        setIsUserActive(true);
        if (inactivityTimeout.current) {
            clearTimeout(inactivityTimeout.current);
        }

        
            inactivityTimeout.current = setTimeout(() => {
                setIsUserActive(false);
                if(!sidebarOpenRef.current)
                {
                setFocus('Dummy_Btn');
                }
            }, 3000); // Hide overlay after 3 seconds of inactivity
        // }
    };

    const onVideoEnd = () => {
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
    }

    const initializePlayer = () => {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const subtitleTracks = [
                    { id: -1, label: 'Off' },  // Add "Off" option
                    ...data.subtitleTracks.map((track) => ({
                        id: track.id,
                        label: track.name || `Subtitle ${track.id}`,
                    })),
                ];
                setCaptions(subtitleTracks);

                const extractedAudioTracks = data.audioTracks.map((track) => ({
                    id: track.id,
                    label: track.name || `Audio ${track.id}`,
                }));
                setAudioTracks(extractedAudioTracks);

                videoRef.current.play();
            });

            hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
                setSelectedCaption(data.id);
            });

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                setSelectedAudio(data.id);
            });

            videoRef.current.hls = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = src;
            videoRef.current.addEventListener('canplay', () => {
                videoRef.current.play();
            });

            videoRef.current.play();
        } else {
            console.log('video not supported');
        }
    };

    useEffect(() => {
        const handleKeyDownWrapper = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleKeyDown(e);
        };

        window.addEventListener('keydown', handleKeyDownWrapper);
        if (videoRef.current) {
            videoRef.current.addEventListener('ended', onVideoEnd);
        }
        initializePlayer();
        setIsUserActive(false);

        return () => {
            window.removeEventListener('keydown', handleKeyDownWrapper);

            if (videoRef.current) {
                videoRef.current.removeEventListener('ended', onVideoEnd);
            }

            if (videoRef.current && videoRef.current.hls) {
                videoRef.current.hls.destroy();
            }
        };
    }, [src]);

    useEffect(() => {
        sidebarOpenRef.current = sidebarOpen;
    }, [sidebarOpen]);

    useEffect(() => {
        userActivityRef.current = isUserActive;
    }, [isUserActive]);

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

    return (
        <div className="video-container">
            <video ref={videoRef} className="video-player"
                controls={false}
            ></video>

            {isUserActive && (
                <div
                    className={`icon-overlay`}
                >
                        <Popup
                            onVideoSettingsPressed={onVideoSettingsPressed}
                            onAudioSubtitlesSettingsPressed={onAudioSubtitlesSettingsPressed}
                           onBackPress={handleBackPressed}
                            videoRef={videoRef}
                            title={movieTitle}
                            focusKey={'video-overlay'}
                        />

                    
                </div>)}
                
                {showSeekIcon && (
                <div className="seek-icon">
                            {seekDirection === "forward" ? (<div className="forward">
                                <p>10</p> <MdFastForward />
                            </div>
                            ) : (<div className={'rewind'}>
                                <MdFastRewind /> <p>10</p>
                            </div>
                            )}
                        </div>
                    )}

                    {showPlayIcon && (
                        <div className='play-icon'>
                            {isPlaying ? 
                            (<>
                               <MdPlayArrow /> 
                            </>) : 
                            (<>
                                <MdOutlinePause />
                            </>)}
                        </div>
                    )}

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
                activeTabs={activeTabsRef.current}
            />
        </div>
    );
};

export default VideoPlayer;
