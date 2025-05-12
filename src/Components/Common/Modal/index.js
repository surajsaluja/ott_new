import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FocusableButton from '../FocusableButton';
import { useFocusable, setFocus, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './index.css';

const Modal = ({ isOpen, onClose, title, content, buttons = [] }) => {
  const { ref, focusSelf, focusKey: currentFocusKey } = useFocusable({ focusKey: 'MODAL_BUTTONS' });

  useEffect(() => {
      focusSelf();
  }, [isOpen]);

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
