import React, { createContext, useContext, useState } from 'react';

const backArrayContext = createContext();

export function BackArrayProvider({ children }) {
  const [currentArrayStack, setCurrentArray] = useState([]);
  const [backHandlerClicked, setBackHandlerClicked] = useState(false);

  const setBackArray = (id, resetPrevious = true) => {
  if (resetPrevious) {
    setCurrentArray([id]);
  } else {
    setCurrentArray((prev) => {
      if (prev[prev.length - 1] !== id) {
        const updated = [...prev, id];
        return updated;
      }
      return prev;
    });
  }
   console.log('<<back array set', currentArrayStack);
};



  const popBackArray = () => {
    
    setCurrentArray((prev) => {
      const newStack = [...prev];
      newStack.pop();
      console.log('<<pop array set', currentArrayStack);
      return newStack;
    });
  };

  return (
    <backArrayContext.Provider
      value={{
        currentArrayStack,
        setBackArray,
        setBackHandlerClicked,
        backHandlerClicked,
        popBackArray,
      }}
    >
      {children}
    </backArrayContext.Provider>
  );
}

export const useBackArrayContext = () => useContext(backArrayContext);