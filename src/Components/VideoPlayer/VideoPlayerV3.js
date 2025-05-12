import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css'; // Custom styles
import { setFocus } from '@noriginmedia/norigin-spatial-navigation';
import Popup from './Popup';
import SideBar_Tab from './SideBar_Tab';
import { useLocation } from 'react-router-dom';
import { MdFastForward, MdFastRewind, MdOutlinePause, MdPlayArrow } from 'react-icons/md';

// Keycode Constants
const KEY_ENTER = 13;
const KEY_BACK = 10009;
const KEY_ESC = 8;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;

const VideoPlayer = () => {
    const location = useLocation();
    const { src, title: movieTitle } = location.state;
    
    const videoRef = useRef(null);
    const playIconTimeout = useRef(null);
    const inactivityTimeout = useRef(null);
    const seekIconTimeout = useRef(null);
    const seekIntervalRef = useRef(null);
    
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayIcon, setShowPlayIcon] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isUserActive, setIsUserActive] = useState(true);
    const [showSeekIcon, setShowSeekIcon] = useState(false);
    const [seekDirection, setSeekDirection] = useState(null);
    
    const seekSpeed = 10; // Seek 10 seconds
    const inactivityDelay = 3000; // Hide UI after 3 seconds
    
    const customResolutions = [
        { minBandwidth: 'auto', maxBandwidth: 'auto', resolution: 'Auto', label: 'Auto', id: -1 },
        { minBandwidth: 0, maxBandwidth: 1000000, resolution: '960x540', label: 'Data Saver', id: 1 },
        { minBandwidth: 1000001, maxBandwidth: 3000000, resolution: '1280x720', label: 'HD', id: 2 },
        { minBandwidth: 3000001, maxBandwidth: 5000000, resolution: '1920x1080', label: 'Full HD', id: 3 },
    ];
    
    // Captions & Audio Tracks
    const [captions, setCaptions] = useState([]);
    const [selectedCaption, setSelectedCaption] = useState(-1);
    const [audioTracks, setAudioTracks] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [selectedQuality, setSelectedQuality] = useState(customResolutions[0].id);
    
    const togglePlayPause = useCallback(() => {
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

    const seekVideo = useCallback((seconds, direction) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setSeekDirection(direction);
            setShowSeekIcon(true);

            clearTimeout(seekIconTimeout.current);
            seekIconTimeout.current = setTimeout(() => setShowSeekIcon(false), 700);
        }
    }, []);

    const handleBackPressed = useCallback(() => {
        if (window.history.length > 1) {
            window.history.back();
        }
    }, []);

    const handleKeyDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

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
                seekVideo(-seekSpeed, 'backward');
                break;
            case KEY_RIGHT:
                seekVideo(seekSpeed, 'forward');
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
        if (!videoRef.current) return;
        
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setCaptions([{ id: -1, label: 'Off' }, ...data.subtitleTracks.map(track => ({
                    id: track.id,
                    label: track.name || `Subtitle ${track.id}`,
                }))]);
                setAudioTracks(data.audioTracks.map(track => ({
                    id: track.id,
                    label: track.name || `Audio ${track.id}`,
                })));

                videoRef.current.play();
            });

            videoRef.current.hls = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = src;
            videoRef.current.play();
        }
    }, [src]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        videoRef.current?.addEventListener('ended', () => setIsPlaying(false));

        initializePlayer();
        resetInactivityTimeout();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            videoRef.current?.removeEventListener('ended', () => setIsPlaying(false));
            videoRef.current?.hls?.destroy();
            clearTimeout(playIconTimeout.current);
            clearTimeout(seekIconTimeout.current);
            clearTimeout(inactivityTimeout.current);
        };
    }, [initializePlayer, handleKeyDown, resetInactivityTimeout]);

    return (
        <div className="video-container">
            <video ref={videoRef} className="video-player" controls={false}></video>

            {isUserActive && (
                <Popup
                    onVideoSettingsPressed={() => setSidebarOpen(true)}
                    onBackPress={handleBackPressed}
                    videoRef={videoRef}
                    title={movieTitle}
                    focusKey={'video-overlay'}
                />
            )}

            {showSeekIcon && (
                <div className="seek-icon">
                    {seekDirection === "forward" ? (
                        <div className="forward">
                            <p>10</p> <MdFastForward />
                        </div>
                    ) : (
                        <div className="rewind">
                            <MdFastRewind /> <p>10</p>
                        </div>
                    )}
                </div>
            )}

            {showPlayIcon && (
                <div className="play-icon">
                    {isPlaying ? <MdPlayArrow /> : <MdOutlinePause />}
                </div>
            )}

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
        </div>
    );
};

export default VideoPlayer;
