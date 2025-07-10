import React, { createContext, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';

const BackHandlerContext = createContext();

export function BackHandlerProvider({ children }) {
    const backHandlerStack = useRef([]);
    const history = useHistory();

    const setBackHandler = (handler) => {
        if (typeof handler === 'function') {
            backHandlerStack.current.push(handler);
        }
    };

    const clearBackHandler = () => {
        backHandlerStack.current.pop();
    };

    const handleBackPress = () => {
        const handler = backHandlerStack.current[backHandlerStack.current.length - 1];
        if (handler) {
            handler();
        } else {
            history.goBack();
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
