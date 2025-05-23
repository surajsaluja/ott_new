import React, { createContext, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';

const BackHandlerContext = createContext();

export function BackHandlerProvider({ children }) {
    const backHandlerRef = useRef(null);
    const history = useHistory();

    const setBackHandler = (handler) => {
        backHandlerRef.current = handler;
    };

    const clearBackHandler = () => {
        backHandlerRef.current = null;
    };

    const handleBackPress = () => {
        if (backHandlerRef.current) {
            backHandlerRef.current(); // call custom back
        } else {
            // default behavior, like goBack()
            history.goBack(); // Or your router's goBack()
        }
    };

    return (
        <BackHandlerContext.Provider value={{ setBackHandler, clearBackHandler, handleBackPress }}>
            {children}
        </BackHandlerContext.Provider>
    );
}

export function useBackHandler() {
    return useContext(BackHandlerContext);
}
