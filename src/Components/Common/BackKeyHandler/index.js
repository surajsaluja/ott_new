// src/Components/BackKeyListener.js
import { useEffect } from 'react';
import { useBackHandler } from '../../../Context/BackHandlerContext';

const BackKeyListener = () => {
  const { handleBackPress } = useBackHandler();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 10009) {
        e.preventDefault();
        handleBackPress();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackPress]);

  return null;
};

export default BackKeyListener;
