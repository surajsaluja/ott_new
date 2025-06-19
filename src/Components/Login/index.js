import React from 'react';
import FocusableButton from '../Common/FocusableButton';
import {
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';
import useLoginScreen from './Hooks/useLoginSceen'
import './index.css';
import { kableOneLogo } from '../../assets'
import { FaDeleteLeft } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';

const LoginScreen = () => {

  const {
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
    logout
  } = useLoginScreen();

  return (
    <div className="login-container">
      <div className='logo-container'>
        <div className='image-container'>
          <img src={kableOneLogo} />
        </div>
        <div className='info-container'>
          <p>Launch the KableOne App on Your Phone.</p>
          <p>Now Select the Mobile App's Profile.</p>
          <p>Next, select Login To TV and then generate code.</p>
          <p>In Your TV, enter generated Code</p>
        </div>
      </div>
      <div className='otp-container'>
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

        <p className="alert-msg">{alertMsg}</p>
        <FocusContext.Provider value="LOGIN_KEYPAD">
          <div className="keypad" ref={ref}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear', 0, 'delete'].map((num) => (
              <FocusableButton
                key={num}
                className="keypad-key"
                focusClass='keypad-key-focus'
                text={num == 'delete' || num == 'clear' ? '' : num}
                icon={((num == 'delete' && <FaDeleteLeft />) || (num == 'clear' && <MdDelete />))}
                onEnterPress={() => handleDigitInput(num.toString())}
              />
            ))}
          </div>
          <div>
             <FocusableButton
              className='submit-button logout-button'
              focusClass='keypad-key-focus'
              text={isLoggedIn ? 'Logout' : 'Login'}
              onEnterPress={isLoggedIn ? () => logout() : () => submitOtp()}
            />
          </div>
        </FocusContext.Provider>
      </div>
    </div>
  );
};

export default LoginScreen;
