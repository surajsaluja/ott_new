import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavigation from './Navigation';
import { useBackHandler } from './Context/BackHandlerContext';
import { getCache, CACHE_KEYS, SCREEN_KEYS } from './Utils/DataCache';
import { useHistory } from 'react-router-dom';
import { kableOneLogo } from './assets';
import { MdError } from 'react-icons/md';
import { useBackArrayContext } from './Context/backArrayContext';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center',
});

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionError, setSessionError] = useState(null);
  const idleTimer = useRef(null);
  const idleTimeoutRef = useRef(null);
  const screenSaverContentRef = useRef([]);
  const hasInitializedSession = useRef(false);
  const history = useHistory();
  const {setBackHandlerClicked}=useBackArrayContext();
  const debounceRef = useRef(null);

  const { fetchApiKeyAndSetSession, isLoadingSession } = useAuth();
  const { handleBackPress } = useBackHandler();

  const isPlayerScreen = useCallback(() => {
    const currentScreen = getCache(CACHE_KEYS.CURRENT_SCREEN);
    return Object.values(SCREEN_KEYS.PLAYER).includes(currentScreen);
  }, []);

  const isScreensaverScreen = useCallback(() => {
    const currentScreen = getCache(CACHE_KEYS.CURRENT_SCREEN);
    return currentScreen === SCREEN_KEYS.SCREEN_SAVER;
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!idleTimeoutRef.current || screenSaverContentRef.current.length === 0) return;

    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!isPlayerScreen() && !isScreensaverScreen() && isOnline) {
        history.push('/screenSaver');
      }
    }, idleTimeoutRef.current);
  }, [history, isOnline, isPlayerScreen, isScreensaverScreen]);

  const initialiseSession = useCallback(async () => {
    try {
      const sessionRes = await fetchApiKeyAndSetSession();
      if (sessionRes?.isSuccess) {
        setSessionError(null);
        idleTimeoutRef.current = getCache(CACHE_KEYS.API_KEY.APP_IDLE_TIME) || 300000; // 5 mins fallback
        screenSaverContentRef.current = getCache(CACHE_KEYS.SCREENSAVER_CONTENT.SCREENSAVER_DATA) || [];
        resetIdleTimer();
      } else {
        throw new Error(sessionRes.message);
      }
    } catch (err) {
      const msg = `Session initialization failed: ${err.message || err}`;
      setSessionError(msg);
      toast.error(msg);
      hasInitializedSession.current = false;
    }
  }, [fetchApiKeyAndSetSession, resetIdleTimer]);

  useEffect(() => {
    if (isOnline && !hasInitializedSession.current) {
      hasInitializedSession.current = true;
      initialiseSession();
    }
  }, [isOnline, initialiseSession]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isPlayerScreen()) toast.success('You are online !!');
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (!isPlayerScreen()) toast.warn('No Internet Connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isPlayerScreen]);

  useEffect(() => {
  const onKeyDown = (e) => {
    resetIdleTimer();

    const isBackKey = ['Backspace', 'Escape'].includes(e.key) || e.keyCode === 10009;
    if (!isBackKey) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    if (debounceRef.current) return; // Ignore if still in debounce window

    setBackHandlerClicked(true);

    // Block further presses for 600ms
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
    }, 600);
  };

    window.addEventListener('keydown', onKeyDown, true);
    resetIdleTimer();

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      clearTimeout(idleTimer.current);
    };
  }, [handleBackPress, resetIdleTimer]);

  // Render Splash
  if (isLoadingSession || sessionError) {
    return (
      <div className="App">
        <div className="loading-splash-screen">
          <img className="loading" src={kableOneLogo} alt="Loading..." />
          {sessionError && <div>{sessionError}</div>}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // Offline screen
  if (!isOnline && hasInitializedSession.current && !isPlayerScreen()) {
    return (
      <div className="App">
        <div className="error-container">
          <div className="error-icon"><MdError /></div>
          <div className="error-message">No Internet Connection</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <AppNavigation />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
