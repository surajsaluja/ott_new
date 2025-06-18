import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Modal from '../Components/Common/Modal';
import { setModalOpener } from '../Utils';
import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const previousFocusKeyRef = useRef(null);

  const openModal = useCallback(({ title, description, buttons }) => {
    if(!previousFocusKeyRef.current){
    previousFocusKeyRef.current = getCurrentFocusKey();
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
          action: setFocusToPrevElement,
        },
      ],
    });
  }, []);

  const setFocusToPrevElement = () =>{
    if(!previousFocusKeyRef.current) return false;
    setTimeout(() => {
      if (previousFocusKeyRef.current) {
        setFocus(previousFocusKeyRef.current);
        previousFocusKeyRef.current = null;
      }
    }, 0);
  }

  const closeModal = useCallback(() => {
    setModalConfig({ isOpen: false });
  }, []);

  useEffect(() => {
    setModalOpener(openModal);
  }, [openModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalConfig.isOpen && (
        <Modal
          onClose={()=>{
            setFocusToPrevElement();
            closeModal();
          }}
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          content={modalConfig.content}
          buttons={modalConfig.buttons?.map(btn => ({
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
