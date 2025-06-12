import { FocusContext, setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { MdSettings, MdArrowBack, MdOutlineSubtitles } from "react-icons/md";
import useOverrideBackHandler from "../../Hooks/useOverrideBackHandler";
import "./Popup.css";
import { useEffect } from "react";

const Popup = ({
  focusKey,
  onVideoSettingsPressed,
  onAudioSubtitlesSettingsPressed,
  onBackPress,
  videoRef,
  title,
  isVisible,
  handleBackButtonPressed
}) => {
  const {
    ref,
    focusKey: currentFocusKey,
    focusSelf,
  } = useFocusable({
    focusKey,
    trackChildren: true,
  });

  // useEffect(()=>{
  //   if(isVisible){
  //     setTimeout(()=>{
  //       setFocus('settingsBtn');
  //     },0);
  // }
  // },[focusSelf, isVisible])

  // Close the drawer instead of navigating back
  useOverrideBackHandler(() => {
    if(isVisible){
    onBackPress();
    }
  });

  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        width: "100%",
        height: "200px",
        zIndex: 10,
        opacity: isVisible ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.3s ease-in-out",
      }}
      ref={ref}
    >
      <div>
        <FocusableButton
          focuskey={"backBtn"}
          onEnterPress={handleBackButtonPressed}
          key={1}
          className={`popup_backButton`}
          focusClass={`popup_backButton_focus`}
          icon={<MdArrowBack />}
        />
        <p className={"popup_title"}>{title}</p>
        <div className={"settings_icons"}>
          <FocusableButton
            key={2}
            focuskey={"settingsBtn"}
            onEnterPress={onVideoSettingsPressed}
            icon={<MdSettings />}
            className={`popup_settingButton`}
            focusClass={`popup_settingButton_focus`}
            text={"Quality"}
          />
          <FocusableButton
            key={3}
            focuskey={"subtitlesBtn"}
            onEnterPress={onAudioSubtitlesSettingsPressed}
            icon={<MdOutlineSubtitles />}
            className={`popup_settingButton`}
            focusClass={`popup_settingButton_focus`}
            text={"Audio & Subtitles"}
          />
        </div>
      </div>
    </div>
    </FocusContext.Provider>
  );
};

export default Popup;
