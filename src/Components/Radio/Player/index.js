import React, { useRef, useState, useEffect } from 'react';
import { FocusContext, setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import FocusableButton from '../../Common/FocusableButton';
import { useHistory, useLocation } from 'react-router-dom';
import Spinner from '../../Common/Spinner';
import './index.css'
import { MdArrowBack, MdOutlinePause, MdPlayArrow } from 'react-icons/md';
import useOverrideBackHandler from '../../../Hooks/useOverrideBackHandler';
import { CACHE_KEYS, SCREEN_KEYS, setCache } from '../../../Utils/DataCache';

export default function RadioPlayer({ focusKey }) {

    const audioRef = useRef(null);
    const isPlayingRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const location = useLocation();
    const { audioName, audioImage, audioplayUrl } = location.state || {};

    const { ref, focusKey: currentFocusKey } = useFocusable({ focusKey });

    const onBackPress = () => {
        history.goBack();
    }

    useOverrideBackHandler(() => {
        onBackPress();
    });

    useEffect(() => {
        if (!isLoading) {
            setFocus('RADIO_PLAY_PAUSE_BUTTON_FOCUS_KEY');
        }
    }, [isLoading])

    const handleSetIsPlaying = async (val) => {
        let audio = audioRef.current;
        if (!audio) return;

        if (val === !!isPlayingRef.current) return;

        try {
            if (val && audio.paused) {
                await audio.play();
                isPlayingRef.current = true;
                setIsPlaying(true);
            } else if (!val && (!audio.paused || audio.ended)) {
                await audio.pause();
                isPlayingRef.current = false;
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Error in handleSetIsPlaying:", error);
        }
    }

    const togglePlayPause = () => {
        handleSetIsPlaying(!isPlaying);
    }

    useEffect(() => {
        setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.PLAYER.RADIO_PLAYER_PAGE);
        const audio = audioRef.current;
        if (!audio) return;

        setIsLoading(true);

        audio.src = audioplayUrl;
        audio.load();

        const onPlay = () => { handleSetIsPlaying(true); }
        const onPause = () => { handleSetIsPlaying(false); }
        const onEnded = () => { handleSetIsPlaying(false) };
        const onError = () => console.error('Error playing radio');
        const onLoadStart = () => {
            handleSetIsPlaying(false);
        };
        const onCanPlay = () => {
            setIsLoading(false);
            handleSetIsPlaying(true);
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

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('loadstart', onLoadStart);
        audio.addEventListener('canplay', onCanPlay);
        window.addEventListener('online', handlePlayerOnline);
        window.addEventListener('offline', handlePlayerOffline);
        window.addEventListener('visibilitychange', handlePlayerVisibilityChange)

        return () => {
            audio.pause();
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadstart', onLoadStart);
            audio.removeEventListener('canplay', onCanPlay);
            window.removeEventListener('online', handlePlayerOnline);
            window.removeEventListener('offline', handlePlayerOffline);
            window.removeEventListener('visibilitychange', handlePlayerVisibilityChange)
        };
    }, []);

    return (
        <>
            {isLoading ? (<Spinner />) :
                (<FocusContext.Provider value={currentFocusKey}>
                    <div className="player" style={{ backgroundColor: '#080808', height: '100vh' }} ref={ref}>
                        <div className="radio-top-container">
                            <FocusableButton
                                className={'radio-back-button'}
                                focusClass={'radio-play-pause-focused'}
                                focuskey={'RADIO_BACK_BUTTON_FOCUS_KEY'}
                                icon={<MdArrowBack />}
                                onEnterPress={onBackPress}
                            />
                            <div className='radio-title-wrapper'>
                                {audioName}
                            </div>
                        </div>
                        <div className='image-container-radio'>
                            <img
                                src={audioImage}
                                className='radio-image'
                            />
                        </div>
                        <div className='radio-bottom-container'>
                            <FocusableButton
                                className={'radio-play-pause'}
                                focusClass={'radio-play-pause-focused'}
                                focuskey={'RADIO_PLAY_PAUSE_BUTTON_FOCUS_KEY'}
                                icon={isPlaying ? <MdOutlinePause /> : <MdPlayArrow />}
                                onEnterPress={togglePlayPause}
                            />
                        </div>
                    </div>
                </FocusContext.Provider>)}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </>
    );
}
