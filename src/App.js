import { useEffect, useState, useRef } from 'react';
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

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center',
});

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const idleTimer = useRef(null);
  const idleTimeoutRef = useRef(null);
  const screenSaverContentRef = useRef([]);
  const hasInitializedSession = useRef(false);
  const history = useHistory();

  const { fetchApiKeyAndSetSession, isLoadingSession } = useAuth();
  const { handleBackPress } = useBackHandler();

  // Check if the current screen is a player screen
  const isPlayerScreen = () => {
    const currentScreen = getCache(CACHE_KEYS.CURRENT_SCREEN);
    return Object.values(SCREEN_KEYS.PLAYER).includes(currentScreen);
  };

  const isScreensaverScreen = () => {
    const currentScreen = getCache(CACHE_KEYS.CURRENT_SCREEN);
    return currentScreen === SCREEN_KEYS.SCREEN_SAVER;
  };

  const initialiseSession = async () => {
    try {
      await fetchApiKeyAndSetSession();
      idleTimeoutRef.current =
        getCache(CACHE_KEYS.API_KEY.APP_IDLE_TIME) || 300000; // fallback 5 mins
      screenSaverContentRef.current =
        getCache(CACHE_KEYS.SCREENSAVER_CONTENT.SCREENSAVER_DATA) || [];
      resetIdleTimer();
    } catch (err) {
      toast.error('Session initialization failed');
    } finally {
      hasInitializedSession.current = true;
    }
  };

  const resetIdleTimer = () => {
    if (
      !idleTimeoutRef.current ||
      screenSaverContentRef.current.length === 0
    ) {
      return;
    }

    clearTimeout(idleTimer.current);

    if (!isPlayerScreen() && !isScreensaverScreen() && isOnline) {
      idleTimer.current = setTimeout(() => {
        history.push('/screenSaver');
      }, idleTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (isOnline && !hasInitializedSession.current) {
      hasInitializedSession.current = true; // lock
      initialiseSession();
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isPlayerScreen()) {
        toast.success('You are online !!');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!isPlayerScreen()) {
        toast.warn('No Internet Connection');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      resetIdleTimer();

      if (['Backspace', 'Escape'].includes(e.key) || e.keyCode === 10009) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handleBackPress();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    resetIdleTimer();

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      clearTimeout(idleTimer.current);
    };
  }, [handleBackPress]);

  // Session loading splash screen
  if (isLoadingSession) {
    return (
      <div className="App">
        <div className="loading-splash-screen">
          <img className="loading" src={kableOneLogo} alt="Loading..." />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // Offline error screen (but not on player)
  if (!isOnline && hasInitializedSession.current && !isPlayerScreen()) {
    return (
      <div className="App">
        <div className="error-container">
          <div className="error-icon">
            <MdError />
          </div>
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
