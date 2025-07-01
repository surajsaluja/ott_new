import { useEffect, useState, useRef } from 'react';
import './App.css';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavigation from './Navigation';
import { useBackHandler } from './Context/BackHandlerContext';
import Screensaver from './Components/ScreenSaver';
import { getCache, CACHE_KEYS, SCREEN_KEYS } from './Utils/DataCache';
import { useHistory } from 'react-router-dom';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
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

  const initialiseSession = async () => {
    await fetchApiKeyAndSetSession();
    hasInitializedSession.current = true;
    idleTimeoutRef.current = getCache(CACHE_KEYS.API_KEY.APP_IDLE_TIME);
    screenSaverContentRef.current = getCache(CACHE_KEYS.SCREENSAVER_CONTENT.SCREENSAVER_DATA);
    // idleTimeoutRef.current = 20000
    resetIdleTimer();
    console.log('app idle time',idleTimeoutRef.current)
  };

  const resetIdleTimer = () => {
    console.log('app idle time reset');
  if (idleTimeoutRef.current && idleTimeoutRef.current == null || screenSaverContentRef.current && screenSaverContentRef.current.length === 0) return;
  clearTimeout(idleTimer.current);

  const currentScreen = getCache(CACHE_KEYS.CURRENT_SCREEN);
  const isOnPlayerScreen = Object.values(SCREEN_KEYS.PLAYER).includes(currentScreen) || currentScreen === SCREEN_KEYS.SCREEN_SAVER;

  if (!isOnPlayerScreen) {
    idleTimer.current = setTimeout(() => {
      history.push('/screenSaver');
    }, idleTimeoutRef.current);
  }
};


  useEffect(() => {
    if (isOnline && !hasInitializedSession.current) {
      initialiseSession();
    }
  }, [isOnline, fetchApiKeyAndSetSession]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are online !!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('No Internet Connection');
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

      if (e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 10009) {
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

  if (isLoadingSession) {
    return (
      <div className='App'>
        <p className='loading'>Loading ....</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className='App'>
      <AppNavigation />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
