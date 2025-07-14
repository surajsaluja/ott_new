import React, { createContext, useContext, useState } from 'react';

const movieBannerContext = createContext();

export function MovieBannerContext({ children }) {

  const [focusedAssetDataContext, setFocusedAssetDataContext] = useState(null);
  const [bannerDataContext, setBannerDataContext] = useState([]);

  return (
    <movieBannerContext.Provider
      value={{
        focusedAssetDataContext,
        bannerDataContext,
        setFocusedAssetDataContext,
        setBannerDataContext
      }}
    >
      {children}
    </movieBannerContext.Provider>
  );
}

export const useMovieBannerContext = () => useContext(movieBannerContext);