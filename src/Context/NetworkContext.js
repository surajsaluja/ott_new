// Context/SessionContext.js
import React, { createContext, useState, useContext } from 'react';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isDeviceOffline, setIsDeviceOffline] = useState(false);

  return (
    <NetworkContext.Provider value={{ isDeviceOffline, setIsDeviceOffline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
