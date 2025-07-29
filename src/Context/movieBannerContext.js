// BannerContext.js
import { createContext, useState, useCallback, useMemo, useReducer, useRef } from "react";

export const BannerDataContext = createContext();
export const BannerUpdateContext = createContext();
export const FocusedAssetDataContext = createContext();
export const FocusedAssetUpdateContext = createContext();

export default function BannerContextProvider({ children }) {
  const [bannerData, setBannerData] = useState([]);
  const [focusedAssetData, setFocusedAssetData] = useState(null);
  const debounceTimer = useRef(null);

  const updateBannerData = useCallback((data) => {
    setBannerData(data);
  }, []);

  const updateFocusedAssetData = useCallback((data) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

   debounceTimer.current = setTimeout(() => {
      setFocusedAssetData(data);
    }, 1000); 
  }, []);

  const updateBannerContextValue = useMemo(
    () => updateBannerData,
    [updateBannerData]
  );

  const updateFocusedAssetContextValue = useMemo(
    () => updateFocusedAssetData,
    [updateFocusedAssetData]
  );

  return (
    <BannerUpdateContext.Provider value={updateBannerContextValue}>
      <BannerDataContext.Provider value={bannerData}>
        <FocusedAssetUpdateContext.Provider
          value={updateFocusedAssetContextValue}
        >
          <FocusedAssetDataContext.Provider value={focusedAssetData}>
            {children}
          </FocusedAssetDataContext.Provider>
        </FocusedAssetUpdateContext.Provider>
      </BannerDataContext.Provider>
    </BannerUpdateContext.Provider>
  );
}
