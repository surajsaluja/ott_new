import React, { useRef, useState, useEffect } from 'react';
import { FocusContext, setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import FocusableButton from '../../Common/FocusableButton';
import { useHistory, useLocation } from 'react-router-dom';
import Spinner from '../../Common/Spinner';
import './index.css'
import { MdArrowBack, MdOutlinePause, MdPlayArrow } from 'react-icons/md';
import useOverrideBackHandler from '../../../Hooks/useOverrideBackHandler';

export default function RadioPlayer({ focusKey }) {

    const audioRef = useRef(null);
    const isPlayingRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const location = useLocation();
     const {audioName, audioImage, audioplayUrl}  = location.state || {};

    const { ref, focusKey: currentFocusKey} = useFocusable({ focusKey });

    const onBackPress = () => {
        history.goBack();
    }

    useOverrideBackHandler(() => {
        onBackPress();
    });

    useEffect(()=>{
        if(!isLoading){
            setFocus('RADIO_PLAY_PAUSE_BUTTON_FOCUS_KEY');
        }
    },[isLoading])

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
        const audio = audioRef.current;
        if (!audio) return;

        setIsLoading(true);

        audio.src = audioplayUrl;
        audio.load();

        const onPlay = () => { console.log('playing'); handleSetIsPlaying(true); }
        const onPause = () => { console.log('audio paused'); handleSetIsPlaying(false); }
        const onEnded = () => { console.log('ended'); handleSetIsPlaying(false) };
        const onError = () => console.error('Error playing radio');
        const onLoadStart = () => {
            handleSetIsPlaying(false);
            console.log('Loading started');
        };
        const onCanPlay = () => {
            setIsLoading(false);
            console.log('can play');
            handleSetIsPlaying(true);
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('loadstart', onLoadStart);
        audio.addEventListener('canplay', onCanPlay);

        return () => {
            audio.pause();
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadstart', onLoadStart);
            audio.removeEventListener('canplay', onCanPlay);
        };
    }, []);

    return (
        <>
            {isLoading ? (<Spinner />) :   
            (<FocusContext.Provider value={currentFocusKey}>
                <div className="player" style={{ backgroundColor: 'black', height: '100vh' }} ref={ref}>
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
