import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import FocusableButton from '../FocusableButton';
import { MdError } from 'react-icons/md';
import { exitApplication } from '../../../Utils';
import { useBackArrayContext } from '../../../Context/backArrayContext';
import { isVisible } from '@testing-library/user-event/dist/utils';

const NetworkErrorModal = ({isOpen, showRetryButton, showExitApplicationButton, handlRetryClicked, addBackListener }) => {
  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
    focusKey: 'NETWORK_ERROR_CONTAINER',
  });

    const { setBackHandlerClicked, setBackArray, backHandlerClicked, currentArrayStack, popBackArray } = useBackArrayContext();
  

  useEffect(() => {
    if (isOpen) {
      setFocus('Close_Btn');
    }
  }, [isOpen, focusSelf]);

  useEffect(() => {
    if(addBackListener){
    setBackArray('NETWORK_ERROR_MODAL', false);
    }
  }, [addBackListener])

  useEffect(() => {
    if (backHandlerClicked && currentArrayStack.length > 0 && addBackListener){
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === 'NETWORK_ERROR_MODAL') {
        exitApplication();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack, addBackListener]);

  if (!isOpen) return null;

  return createPortal(
    <div className="network-error-overlay">
      <FocusContext.Provider value={currentFocusKey}>
              <div className="error-container">
                <div className="error-icon"><MdError /></div>
                <div className="error-message">No Internet Connection</div>
                <div className='app-network-btn-container' ref={ref}>
               <FocusableButton 
                    text="RETRY" 
                    className='netowrk_error_button' 
                    focusClass='netowrk_error_button_focus'
                    focuskey={'RETRY_BTN_FOCUS_KEY_NETWORK_ERROR'}
                    onEnterPress={handlRetryClicked}
                  />

                  {showExitApplicationButton && <FocusableButton
                    text='EXIT APPLICATION' 
                    className='netowrk_error_button' 
                    focusClass='netowrk_error_button_focus'
                    focuskey={'EXIT_BTN_FOCUS_KEY_NETWORK_ERROR'}
                    onEnterPress={exitApplication}
                  />}
                </div>
              </div>
          </FocusContext.Provider>
    </div>,
    document.body
  );
};

export default NetworkErrorModal;
