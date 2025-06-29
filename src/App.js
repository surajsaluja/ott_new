import { useEffect, useState, useRef } from 'react';
import './App.css';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavigation from './Navigation';
import { useBackHandler } from './Context/BackHandlerContext';
import Screensaver from './Components/ScreenSaver';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const idleTimer = useRef(null);
  const hasInitializedSession = useRef(false);

  const { fetchApiKeyAndSetSession, isLoadingSession } = useAuth();
  const { handleBackPress } = useBackHandler();
  const isVideoPlaying = false;

  const IDLE_TIMEOUT = 60 * 1000; // 60 seconds

  const initialiseSession = async () => {
    await fetchApiKeyAndSetSession();
    hasInitializedSession.current = true;
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimer.current);
    if (!isVideoPlaying) {
      idleTimer.current = setTimeout(() => {
        setShowScreensaver(true);
      }, IDLE_TIMEOUT);
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

      if (showScreensaver) {
        e.preventDefault();
        e.stopPropagation();
        setShowScreensaver(false);
        return;
      }

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
  }, [handleBackPress, showScreensaver, isVideoPlaying]);

  useEffect(() => {
    // When playback status changes, reset timer if video is paused/stopped
    if (!isVideoPlaying) {
      resetIdleTimer();
    } else {
      clearTimeout(idleTimer.current); // Stop screensaver while video plays
      setShowScreensaver(false); // Hide if currently shown
    }
  }, [isVideoPlaying]);

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
      {showScreensaver && <Screensaver />}
    </div>
  );
}

export default App;
