import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  doesFocusableExist,
  getCurrentFocusKey,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import RetryPopup from "../Components/Common/Modal/RetryModal";
import { CACHE_KEYS, getCache } from "../Utils/DataCache";

const RetryModalContext = createContext();
const FOCUS_RESET_DELAY = 200;

export const useRetryModal = () => useContext(RetryModalContext);

export const RetryModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [callerId, setCallerId] = useState(null);
  const previousFocusKeyRef = useRef(null);

  const setFocusToPreviousElement = useCallback(() => {
    const previousKey = previousFocusKeyRef.current;
    console.log(`$ does focus exist ${doesFocusableExist(previousFocusKeyRef)}`);
    let isPreviousFocusExist = doesFocusableExist(previousFocusKeyRef);
    if (previousKey && isPreviousFocusExist) {
      setTimeout(() => {
        setFocus(previousKey);
        previousFocusKeyRef.current = null;
      }, FOCUS_RESET_DELAY);
    } else {
      console.warn(
        "No previous focus key available. Consider setting a fallback."
      );
    }
  }, []);

  // Open modal with caller ID and content
  const openRetryModal = useCallback(
    ({ title, description, id }) => {

      if (getCache(CACHE_KEYS.SHOW_NO_INTERNET_MESSAGE) === false) return;

      const currentFocusKey = getCurrentFocusKey();

      if (!previousFocusKeyRef.current && currentFocusKey) {
        previousFocusKeyRef.current = currentFocusKey;
      } else if (!currentFocusKey) {
        console.warn("Could not save focus key — no active focus.");
      }

      setTitle(title);
      setDescription(getCache(CACHE_KEYS.NO_INTERNET_SERVER_MESSAGE));
      setRetrying(false);
      setRetryCount(0);
      setCallerId(id);
      setIsOpen(true);
    },
    [isOpen]
  );

  // Close modal and cleanup
  const closeRetryModal = () => {
    if (getCache(CACHE_KEYS.SHOW_NO_INTERNET_MESSAGE) === false) return;
    setFocusToPreviousElement();
    setIsOpen(false);
    setCallerId(null);
    setRetrying(false);
  };

  // Called when Retry button is clicked
  const handleRetry = async () => {
    if (!callerId || getCache(CACHE_KEYS.SHOW_NO_INTERNET_MESSAGE) === false) return;

    setRetrying(true);
    setRetryCount((prev) => prev + 1);
  };

  // Called by the caller once its retry logic is done
  const markRetryComplete = () => {
          if(getCache(CACHE_KEYS.SHOW_NO_INTERNET_MESSAGE) === false) return;
    setRetrying(false);
  };

  return (
    <RetryModalContext.Provider
      value={{
        openRetryModal,
        closeRetryModal,
        markRetryComplete,
        retrying,
        retryCount,
        callerId,
        setCallerId,
      }}
    >
      {children}
      <RetryPopup
        isOpen={isOpen}
        title={title}
        description={description}
        retryCount={retryCount}
        retrying={retrying}
        onRetry={handleRetry}
        onClose={closeRetryModal}
      />
    </RetryModalContext.Provider>
  );
};
