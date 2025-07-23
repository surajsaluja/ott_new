import React, { useEffect } from 'react';
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import FocusableButton from '../Common/FocusableButton';
import { streamLimitError } from '../../assets';
import './StreamLimitModal.css';
import { SCREEN_KEYS } from '../../Utils/DataCache';
import { useBackArrayContext } from '../../Context/backArrayContext';

const StreamLimitModal = () => {
  const history = useHistory();
  const {setBackArray, backHandlerClicked,currentArrayStack, setBackHandlerClicked, popBackArray} = useBackArrayContext();

  const onClose = () => {
    history.goBack();
  };

  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey: 'StreamLimitModal',
    isFocusBoundary: true,
  });

  useEffect(() => {
   focusSelf();
  }, [focusSelf]);

  useEffect(()=>{
      setBackArray(SCREEN_KEYS.STREAMLIMIT_SCREEN, true);
    },[]);
  
    useEffect(() => {
     if (backHandlerClicked && currentArrayStack.length > 0) {
      const backId = currentArrayStack[currentArrayStack.length - 1];
  
      if (backId === SCREEN_KEYS.STREAMLIMIT_SCREEN) {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

  return (
    <div className="stream-modal-overlay">
      <FocusContext.Provider value={focusKey}>
        <div ref={ref} className="stream-modal-content">
          <h2 className="stream-modal-title">Stream Limit Reached</h2>
          <div className="stream-modal-image-wrapper">
            <img src={streamLimitError} alt="Error" className="stream-modal-image" />
          </div>
          <p className="stream-modal-text large">You Have Reached Streaming Capacity</p>
          <p className="stream-modal-text small">
            To start watching here, please stop streaming on another device signed in to your account.
          </p>
          <div className="stream-modal-button-wrapper">
            <FocusableButton
              className="stream-modal-button"
              focusClass="stream-modal-button-focused"
              text="OK"
              onEnterPress={onClose}
              focusKey="Close_Btn"
            />
          </div>
        </div>
      </FocusContext.Provider>
    </div>
  );
};

export default StreamLimitModal;
