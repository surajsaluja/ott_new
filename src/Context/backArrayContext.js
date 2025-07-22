import React, { createContext, useContext, useEffect, useState } from 'react';

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
    // debugger;
    console.log('<<pop array start', currentArrayStack)
    setCurrentArray((prev) => {
      console.log(prev);
      const newStack = [...prev];
      console.log('new stack 1 ', newStack);
      newStack.pop();
      console.log('<<pop array set', newStack);
      return newStack;
    });
    console.log('<<pop array stop', currentArrayStack);
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