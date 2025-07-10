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

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const previousFocusKeyRef = useRef(null);

  // Focus management
  const setFocusToPreviousElement = useCallback(() => {
    const previousKey = previousFocusKeyRef.current;
    if (previousKey) {
      setTimeout(() => {
        setFocus(previousKey);
        previousFocusKeyRef.current = null;
      }, 0);
    } else {
      console.warn('No previous focus key available. Consider setting a fallback.');
      // Optionally: setFocus('MAIN_CONTAINER');
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig({ isOpen: false });
    previousFocusKeyRef.current = null;
  }, []);

  const openModal = useCallback(({ title, description, buttons }) => {
    const currentFocusKey = getCurrentFocusKey();

    if (!previousFocusKeyRef.current && currentFocusKey) {
      previousFocusKeyRef.current = currentFocusKey;
      console.log('Saved current focus key:', currentFocusKey);
    } else if (!currentFocusKey) {
      console.warn('Could not save focus key — no active focus.');
    }

    setModalConfig({
      isOpen: true,
      title,
      content: description,
      buttons: [
        ...buttons,
        {
          label: 'Close',
          className: 'secondary',
          action: setFocusToPreviousElement,
        },
      ],
    });
  }, [setFocusToPreviousElement]);

  // Register modal opener globally
  useEffect(() => {
    setModalOpener(openModal);
  }, [openModal]);

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
          buttons={modalConfig.buttons?.map((btn) => ({
            ...btn,
            action: () => {
              btn.action?.();
              closeModal();
            },
          }))}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
