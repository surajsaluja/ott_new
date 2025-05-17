import React, { useEffect } from "react";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { MdSettings, MdArrowBack, MdOutlineSubtitles } from 'react-icons/md'
import './Popup.css';
import VirtualThumbnailStripWithSeekBar from "../VirtualList";

const Popup = ({ focusKey,
  onVideoSettingsPressed,
  onAudioSubtitlesSettingsPressed,
  onBackPress,
  videoRef,
  title,
  style = {},
  isVisible,
  resetInactivityTimeout,
thumbnailBaseUrl }) => {
  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey });

  useEffect(() => {
    if (isVisible) {
      focusSelf();
    }
  }, [focusSelf, isVisible])

  return (<FocusContext.Provider value={currentFocusKey}>
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      width: '100%',
      height: '100%',
      zIndex: 10,
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
      transition: 'opacity 0.3s ease-in-out',
    }} ref={ref}>
      <div>
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

        <VirtualThumbnailStripWithSeekBar
          videoRef={videoRef}
          thumbnailBaseUrl={thumbnailBaseUrl}
          onClose={()=>{}}
          focusKey={'SEEK_PREVIEW'}
        />


      </div>
    </div>
  </FocusContext.Provider>
  )
}

export default Popup;