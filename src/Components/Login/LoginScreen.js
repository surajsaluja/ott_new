import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../../Context/userContext';

const LoginScreen = () => {
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
  const { handleOTPLogin } = useUserContext();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    setAlertMsg('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key !== 'Backspace' && index === OTP_LENGTH - 1 && otpValues[index]) {
      submitOtp();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pasteData) && pasteData.length === OTP_LENGTH) {
      setOtpValues(pasteData.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const submitOtp = async () => {
    const inputOTP = otpValues.join('');
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
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setAlertMsg('Something went wrong during login');
    } finally {
      setIsSubmittingOTP(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Enter OTP</h2>
      <div style={styles.otpGroup}>
        {otpValues.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
          />
        ))}
      </div>
      {alertMsg && <p style={styles.alert}>{alertMsg}</p>}
      <button
        onClick={submitOtp}
        disabled={isSubmittingOTP}
        style={{
          ...styles.button,
          ...(isSubmittingOTP ? styles.buttonDisabled : {}),
        }}
      >
        {isSubmittingOTP ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    background: '#121212',
    color: '#fff',
    padding: '2rem',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  otpGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  otpInput: {
    width: '3rem',
    height: '3.5rem',
    fontSize: '2rem',
    textAlign: 'center',
    borderRadius: '8px',
    border: '2px solid #ccc',
    background: '#1e1e1e',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  alert: {
    color: 'salmon',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#2979ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
  },
};

export default LoginScreen;
