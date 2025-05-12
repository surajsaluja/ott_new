import React, { useState, useCallback, useEffect } from "react";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import {  MdSettings, MdArrowBack, MdOutlineSubtitles } from 'react-icons/md'
import './Popup.css';
import SeekBar from './SeekBar'

const Popup = ({ focusKey: focusKeyParam,
  onVideoSettingsPressed,
  onAudioSubtitlesSettingsPressed,
  onBackPress,
  videoRef,
    title }) => {
  const { ref, focusKey, focusSelf } = useFocusable();

  useEffect(()=>{
    focusSelf();
  },[focusSelf])

  return (<FocusContext.Provider value={focusKey}>
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      width: '100%',
      height: '100%',
      zIndex: 10
    }}>
      <div ref={ref}>
        <FocusableButton
          focuskey={'backBtn'}
          onEnterPress={onBackPress}
          key={1}
          className={`popup_backButton`}
          focusClass={`popup_backButton_focus`}
          icon={<MdArrowBack />}
        />
        <p className={'popup_title'}>{title}</p>
        <div className={'settings_icons'}>
        <FocusableButton
          key={2}
          focuskey={'settingsBtn'}
          onEnterPress={onVideoSettingsPressed}
          icon={<MdSettings />}
          className={`popup_settingButton`}
          focusClass={`popup_settingButton_focus`}
          text={'Quality'}
        />
        <FocusableButton
        key={3}
        focuskey={'subtitlesBtn'}
        onEnterPress={onAudioSubtitlesSettingsPressed}
        icon={<MdOutlineSubtitles />}
        className={`popup_settingButton`}
        focusClass={`popup_settingButton_focus`}
        text={'Audio & Subtitles'}
        />
        </div>

        <SeekBar
          videoRef={videoRef}
        />
      </div>
    </div>
  </FocusContext.Provider>
  )
}

export default Popup;