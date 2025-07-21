import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useFocusable,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import { useBackArrayContext } from "../../../Context/backArrayContext";
import "./index.css";
import { exitApplication } from "../../../Utils";

const AUTO_CLOSE_TIMEOUT = 30000;

const RetryPopup = ({
  isOpen,
  title,
  description,
  onRetry,
  onClose,
  retrying = false,
  retryCount = 0,
}) => {
  const { ref, focusSelf, focusKey } = useFocusable({
    focusKey: "RETRY_POPUP",
    focusable: isOpen,
    isFocusBoundary: true
  });
  const { setBackArray } = useBackArrayContext();
  const timerRef = useRef(null);

  // Focus on popup open
  useEffect(() => {
    if (isOpen) {
      focusSelf();
      setBackArray("MODAL_RETRY");
    }

    return () => {};
  }, [isOpen, focusSelf]);

  if (!isOpen) return null;

  return createPortal(
    <FocusContext.Provider value={focusKey}>
      <div className="modal-overlay" ref={ref}>
        <div className="modal-box">
          {title && <h2 className="modal-title">{title}</h2>}
          <div className="modal-content">{description}</div>
          <div className="modal-buttons">
            <FocusableButton
              text={retrying ? 'RETRYING' : "RETRY"}
              onEnterPress={onRetry}
              className={"modal-button primary"}
              focusClass="madal-button-focused"
              focuskey="RETRY_BTN_MODAL"
            />
            <FocusableButton
              text="Exit"
              onEnterPress={exitApplication}
              className={"modal-button primary"}
              focusClass="madal-button-focused"
              focuskey="CLOSE_BTN_RETRY_MODAL"
            />
          </div>
        </div>
      </div>
    </FocusContext.Provider>,
    document.body
  );
};

export default RetryPopup;
