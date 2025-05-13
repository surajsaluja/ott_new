import { useEffect, useState, useRef } from 'react';
import './App.css';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavigation from './Navigation';
import { useBackHandler } from './Context/BackHandlerContext';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const hasInitializedSession = useRef(false);
  const { fetchApiKeyAndSetSession, isLoadingSession } = useAuth();
  const { handleBackPress } = useBackHandler();

  useEffect(() => {
    if (isOnline && !hasInitializedSession.current) {
      fetchApiKeyAndSetSession();
      hasInitializedSession.current = true;
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
      if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        handleBackPress();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackPress]);

  if (isLoadingSession || !hasInitializedSession.current) {
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