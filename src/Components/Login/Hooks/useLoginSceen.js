import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "../../../Context/userContext";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useHistory, useLocation } from "react-router-dom";
import { CACHE_KEYS, SCREEN_KEYS, setCache } from "../../../Utils/DataCache";
import { getBannerPlayData } from "../../../Utils/MediaDetails";
import { useBackArrayContext } from "../../../Context/backArrayContext";

const useLoginScreen = () => {
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const inputRefs = useRef([]);
  const [alertMsg, setAlertMsg] = useState("");
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
  const { handleOTPLogin, isLoggedIn, logout } = useUserContext();
  const { ref, focusSelf } = useFocusable({ focusKey: "LOGIN_KEYPAD" });
  const history = useHistory();
  const location = useLocation();

  const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();

  const { from, props } = location.state || {
    from: { pathname: "/" },
    props: {},
  };

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  useEffect(() => {
     if(isLoggedIn){
      history.replace('/profile');
    }else{
    setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.LOGIN);
    }
  }, []);

    useEffect(() => {
    setBackArray(SCREEN_KEYS.LOGIN, true);
  }, []);

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0){
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.LOGIN) {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

  const handleDigitInput = (digit) => {
    setAlertMsg("");
    if (selectedInputIndex >= OTP_LENGTH) return;
    if (isLoggedIn) {
      setAlertMsg("You are already logged in !!");
      return;
    }

    if (digit === "delete") {
      handleDelete();
      return;
    }

    if (digit === "clear") {
      handleClear();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[selectedInputIndex] = digit;
    setOtpValues(newOtp);

    const nextIndex = selectedInputIndex + 1;
    setSelectedInputIndex(nextIndex);

    if (nextIndex < OTP_LENGTH) {
      inputRefs.current[nextIndex]?.focus();
    }

    if (nextIndex === OTP_LENGTH) {
      const inputOTP = newOtp.join("");
      submitOtpWithValue(inputOTP);
    }
  };

  const handleDelete = () => {
    setAlertMsg("");
    if (selectedInputIndex === 0) return;

    const prevIndex = selectedInputIndex - 1;
    const newOtp = [...otpValues];
    newOtp[prevIndex] = "";
    setOtpValues(newOtp);
    setSelectedInputIndex(prevIndex);
    inputRefs.current[prevIndex]?.focus();
  };

  const handleClear = () => {
    setAlertMsg("");
    if (selectedInputIndex === 0) return;

    setOtpValues(Array(OTP_LENGTH).fill(""));
    setSelectedInputIndex(0);
    inputRefs.current[0]?.focus();
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(pasteData) && pasteData.length === OTP_LENGTH) {
      const split = pasteData.split("");
      setOtpValues(split);
      setSelectedInputIndex(OTP_LENGTH);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      submitOtpWithValue(pasteData);
    }
  };

  const redirectToTargetPage  = async () =>{
    if(from === '/play' && props.mediaID && props.categoryID){
       const openWebSeries = props.categoryID === 2 ? true : false;
             const res = await getBannerPlayData(props.mediaID, props.categoryID,props.webSeriesId, openWebSeries,props.isTrailer, null);
             if (res?.isSuccess) {
               history.replace("/play", {
                 src: res.data.mediaDetail.mediaUrl,
                 thumbnailBaseUrl: res.data.mediaDetail?.trickyPlayBasePath,
                 title: res.data.mediaDetail?.title,
                 mediaId: res.data.mediaDetail.mediaID,
                 onScreenInfo: res.data.mediaDetail.onScreenInfo,
                 skipInfo: res.data.mediaDetail.skipInfo,
                 isTrailer: false,
                 playDuration: res.data.mediaDetail?.playDuration,
                 webSeriesId: res.data.mediaDetail.webSeriesId,
                 episodes: res.data.mediaDetail?.episodes || []
               });
             } else {
               history.replace(`/detail/${props.categoryID}/${props.mediaID}/${props.webSeriesId ?? 0}/1`);
             }
    }else{
    history.replace(from, props);
    }
  }

  const submitOtpWithValue = async (inputOTP) => {
    if (inputOTP.length !== OTP_LENGTH) {
      setAlertMsg(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setIsSubmittingOTP(true);
    try {
      const response = await handleOTPLogin(inputOTP);
      if (response.isLoggedIn) {
        setAlertMsg(response.message);
        redirectToTargetPage();
      } else {
        setAlertMsg(response.message);
        setOtpValues(Array(OTP_LENGTH).fill(""));
        setSelectedInputIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setAlertMsg("Something went wrong during login");
    } finally {
      setIsSubmittingOTP(false);
    }
  };

  const submitOtp = () => {
    const inputOTP = otpValues.join("");
    submitOtpWithValue(inputOTP);
  };

  return {
    inputRefs,
    otpValues,
    alertMsg,
    ref,
    isSubmittingOTP,
    isLoggedIn,
    setSelectedInputIndex,
    handlePaste,
    handleDelete,
    handleDigitInput,
    submitOtp,
    logout,
  };
};

export default useLoginScreen;
