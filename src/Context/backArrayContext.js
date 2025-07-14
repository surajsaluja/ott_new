import React, { createContext, useContext, useState } from 'react';

const backArrayContext = createContext();

export function BackArrayProvider({ children }) {
  const [currentArrayStack, setCurrentArray] = useState([]);
  const [backHandlerClicked, setBackHandlerClicked] = useState(false);

  const setBackArray = (id, resetPrevious) => {
  if (resetPrevious) {
    setCurrentArray([id]);
    console.log('Updated back stack:', [id]);
  } else {
    setCurrentArray((prev) => {
      if (prev[prev.length - 1] !== id) {
        const updated = [...prev, id];
        console.log('Updated back stack:', updated);
        return updated;
      }
      return prev;
    });
  }
};



  const popBackArray = () => {
    setCurrentArray((prev) => {
      const newStack = [...prev];
      newStack.pop();
      console.log('popBackArray : ', newStack);
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