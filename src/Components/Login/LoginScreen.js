import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../../Context/userContext';
import FocusableButton from '../Common/FocusableButton/FocusableButton';
import {
  FocusContext,
  useFocusable,
} from '@noriginmedia/norigin-spatial-navigation';
import './LoginScreen.css';

const LoginScreen = () => {
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const inputRefs = useRef([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
  const { handleOTPLogin, isLoggedIn, logout } = useUserContext();
  const { ref, focusSelf } = useFocusable({ focusKey: 'LOGIN_KEYPAD' });

  useEffect(() => {
    focusSelf();
  }, []);

  const handleDigitInput = (digit) => {
    if (selectedInputIndex >= OTP_LENGTH) return;

    const newOtp = [...otpValues];
    newOtp[selectedInputIndex] = digit;
    setOtpValues(newOtp);

    const nextIndex = selectedInputIndex + 1;
    setSelectedInputIndex(nextIndex);

    if (nextIndex < OTP_LENGTH) {
      inputRefs.current[nextIndex]?.focus();
    }

    if (nextIndex === OTP_LENGTH) {
      const inputOTP = newOtp.join('');
      submitOtpWithValue(inputOTP);
    }
  };

  const handleDelete = () => {
    if (selectedInputIndex === 0) return;

    const prevIndex = selectedInputIndex - 1;
    const newOtp = [...otpValues];
    newOtp[prevIndex] = '';
    setOtpValues(newOtp);
    setSelectedInputIndex(prevIndex);
    inputRefs.current[prevIndex]?.focus();
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pasteData) && pasteData.length === OTP_LENGTH) {
      const split = pasteData.split('');
      setOtpValues(split);
      setSelectedInputIndex(OTP_LENGTH);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      submitOtpWithValue(pasteData);
    }
  };

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
      } else {
        setAlertMsg(response.message);
        setOtpValues(Array(OTP_LENGTH).fill(''));
        setSelectedInputIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setAlertMsg('Something went wrong during login');
    } finally {
      setIsSubmittingOTP(false);
    }
  };

  const submitOtp = () => {
    const inputOTP = otpValues.join('');
    submitOtpWithValue(inputOTP);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Enter OTP</h2>
      <div className="otp-group">
        {otpValues.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={digit}
            ref={(ref) => (inputRefs.current[index] = ref)}
            onFocus={() => setSelectedInputIndex(index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="otp-input"
            readOnly
          />
        ))}
      </div>

      {alertMsg && <p className="alert-msg">{alertMsg}</p>}
      <FocusContext.Provider value="LOGIN_KEYPAD">
        <div className="keypad" ref={ref}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <FocusableButton
              key={num}
              className="keypad-key"
              focusClass='keypad-key-focus'
              text={num}
              onEnterPress={() => handleDigitInput(num.toString())}
            />
          ))}
          <FocusableButton
            className="keypad-key"
             focusClass='keypad-key-focus'
            text="⌫"
            onEnterPress={handleDelete}
          />
        </div>
      </FocusContext.Provider>

      <button
        onClick={submitOtp}
        disabled={isSubmittingOTP}
        className={`submit-button ${isSubmittingOTP ? 'disabled' : ''}`}
      >
        {isSubmittingOTP ? 'Logging in...' : 'Login'}
      </button>

      {isLoggedIn && (
        <button onClick={logout} className="submit-button">
          Logout
        </button>
      )}
    </div>
  );
};

export default LoginScreen;
