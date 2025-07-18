import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import Modal from '../Components/Common/Modal';
import { setModalOpener } from '../Utils';
import {
  getCurrentFocusKey,
  setFocus,
} from '@noriginmedia/norigin-spatial-navigation';
import { useBackArrayContext } from './backArrayContext';

const ModalContext = createContext();
const FOCUS_RESET_DELAY = 200;

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const previousFocusKeyRef = useRef(null);

  const {
    setBackArray,
    backHandlerClicked,
    currentArrayStack,
    setBackHandlerClicked,
    popBackArray,
  } = useBackArrayContext();

  const setFocusToPreviousElement = useCallback(() => {
    const previousKey = previousFocusKeyRef.current;
    if (previousKey) {
      setTimeout(() => {
        setFocus(previousKey);
        previousFocusKeyRef.current = null;
      }, FOCUS_RESET_DELAY);
    } else {
      console.warn('No previous focus key available. Consider setting a fallback.');
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig({ isOpen: false });
    previousFocusKeyRef.current = null;
    setBackHandlerClicked(false);
    popBackArray();
  }, [setBackHandlerClicked, popBackArray]);

  const openModal = useCallback(({ title, description, buttons , showCloseButton = true}) => {
    const currentFocusKey = getCurrentFocusKey();

    if (!previousFocusKeyRef.current && currentFocusKey) {
      previousFocusKeyRef.current = currentFocusKey;
    } else if (!currentFocusKey) {
      console.warn('Could not save focus key — no active focus.');
    }

    const updatedButtons = showCloseButton
    ? [
        ...buttons,
        {
          label: 'Close',
          className: 'secondary',
          action: setFocusToPreviousElement,
        },
      ]
    : [...buttons];

    setModalConfig({
      isOpen: true,
      title,
      content: description,
      buttons:updatedButtons
    });
  }, [setBackArray, setFocusToPreviousElement]);

  useEffect(() => {
    setModalOpener(openModal);
  }, [openModal]);

  useEffect(() => {
    if (!modalConfig.isOpen || !backHandlerClicked) return;

    const backId = currentArrayStack[currentArrayStack.length - 1];
    if (backId === 'MODAL') {
      setFocusToPreviousElement();
      closeModal();
    }
  }, [backHandlerClicked, modalConfig.isOpen, currentArrayStack, closeModal, setFocusToPreviousElement]);

  const renderButtons = useCallback(() => {
    return modalConfig.buttons?.map((btn) => ({
      ...btn,
      action: () => {
        btn.action?.();
        closeModal();
      },
    }));
  }, [modalConfig.buttons, closeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalConfig.isOpen && (
        <Modal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          content={modalConfig.content}
          onClose={() => {
            setFocusToPreviousElement();
            closeModal();
          }}
          buttons={renderButtons()}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
