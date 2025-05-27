import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import './StreamLimitModal.css'; // We'll create this CSS file
import { streamLimitError } from '../../assets';
import FocusableButton from '../Common/FocusableButton';

const StreamLimitModal = ({ isOpen, onClose }) => {
  const { ref, focusKey } = useFocusable({
    focusKey: 'StreamLimitModal',
    onEnterPress: onClose,
  });

  useEffect(() => {
    if (isOpen) {
      setFocus('Close_Btn');
    }
  }, [isOpen, focusKey]);

  if (!isOpen) return null;

  return createPortal(
    <div className="stream-modal-overlay">
      <FocusContext.Provider value={focusKey}>
        <div ref={ref} className="stream-modal-content">
          <h2 className="stream-modal-title">Stream Limit Reached</h2>
          <div className="stream-modal-image-wrapper">
            <img src={streamLimitError} alt="Error" className="stream-modal-image" />
          </div>
          <p className="stream-modal-text large">You Have Reached Streaming Capacity</p>
          <p className="stream-modal-text small">
            To start watching here, please stop streaming on another device signed in to your account
          </p>
          <div className="stream-modal-button-wrapper">
            <FocusableButton
              className="stream-modal-button"
              focusClass='stream-modal-button-focused'
              text='OK'
              onEnterPress={onClose}
              focuskey={'Close_Btn'}
            />
          </div>
        </div>
      </FocusContext.Provider>
    </div>,
    document.body
  );
};

export default StreamLimitModal;
