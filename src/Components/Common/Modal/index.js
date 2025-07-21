import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FocusableButton from '../FocusableButton';
import { useFocusable, setFocus, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './index.css';
import { useBackArrayContext } from '../../../Context/backArrayContext';

const autoCloseTimeout = 30000;
const Modal = ({ isOpen, onClose, title, content, buttons = [] }) => {
  const { ref, focusSelf, focusKey: currentFocusKey } = useFocusable({ 
    focusKey: 'MODAL_BUTTONS' ,
    isFocusBoundary: true
  });
  const { setBackArray } = useBackArrayContext();
  const inactivityTimerRef = useRef(null);


  // Focus modal on open
  useEffect(() => {
    if (isOpen && buttons.length > 0) {
      focusSelf();
      startInactivityTimer();
      window.addEventListener('keydown', resetInactivityTimer);
    }
    return () => {
      clearInactivityTimer();
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, [isOpen, focusSelf]);

  useEffect(() => {
    setBackArray('MODAL', false);
  }, []);

  // Timer logic
  const startInactivityTimer = () => {
    clearInactivityTimer(); // Clear any existing timer
    inactivityTimerRef.current = setTimeout(() => {
      onClose?.(); // Auto-close modal
    }, autoCloseTimeout);
  };

  const resetInactivityTimer = () => {
    if (!isOpen) return;
    startInactivityTimer();
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  return createPortal(
    <FocusContext.Provider value={currentFocusKey}>
      <div className="modal-overlay" ref={ref}>
        <div className="modal-box">
          {title && <h2 className="modal-title">{title}</h2>}
          <div className="modal-content">{content}</div>
          <div className="modal-buttons">
            {buttons.map(({ label, action, className = '' }, index) => (
              <FocusableButton
                key={`${label}_${index}`}
                text={label}
                onEnterPress={action}
                className={'modal-button primary'}
                focusClass="madal-button-focused"
                focuskey={`MODAL_${label}_${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>,
    document.body
  );
};

export default Modal;
