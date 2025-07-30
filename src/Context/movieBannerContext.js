// BannerContext.js
import { createContext, useState, useCallback, useMemo, useReducer, useRef } from "react";

export const BannerDataContext = createContext();
export const BannerUpdateContext = createContext();
export const FocusedAssetDataContext = createContext();
export const FocusedAssetUpdateContext = createContext();
export const IsFocusedAssetEmptyContext = createContext();

export default function BannerContextProvider({ children }) {
  const [bannerData, setBannerData] = useState([]);
  const [focusedAssetData, setFocusedAssetData] = useState(null);
  const debounceTimer = useRef(null);

  const updateBannerData = useCallback((data) => {
    setBannerData(data);
  }, []);

  const updateFocusedAssetData = useCallback((data, updateImmidiate = false) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (updateImmidiate) {
      setFocusedAssetData(data);
    } else {
      debounceTimer.current = setTimeout(() => {
        setFocusedAssetData(data);
      }, 1000);
    }
  }, []);

  const updateBannerContextValue = useMemo(
    () => updateBannerData,
    [updateBannerData]
  );

  const updateFocusedAssetContextValue = useMemo(
    () => updateFocusedAssetData,
    [updateFocusedAssetData]
  );

  const isFocusedAssetEmpty = useMemo(() => {
    return (
      !focusedAssetData ||
      (typeof focusedAssetData === "object" &&
        Object.keys(focusedAssetData).length === 0)
    );
  }, [focusedAssetData]);


  return (
    <BannerUpdateContext.Provider value={updateBannerContextValue}>
      <BannerDataContext.Provider value={bannerData}>
        <FocusedAssetUpdateContext.Provider
          value={updateFocusedAssetContextValue}
        >
          <FocusedAssetDataContext.Provider value={focusedAssetData}>
            <IsFocusedAssetEmptyContext.Provider value={isFocusedAssetEmpty}>
              {children}
            </IsFocusedAssetEmptyContext.Provider>
          </FocusedAssetDataContext.Provider>
        </FocusedAssetUpdateContext.Provider>
      </BannerDataContext.Provider>
    </BannerUpdateContext.Provider>
  );
}
