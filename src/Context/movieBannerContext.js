// BannerContext.js
import { createContext, useState, useCallback, useMemo } from "react";

export const BannerDataContext = createContext();
export const BannerUpdateContext = createContext();
export const FocusedAssetDataContext = createContext();
export const FocusedAssetUpdateContext = createContext();

export default function BannerContextProvider({ children }) {
  const [bannerData, setBannerData] = useState([]);
  const [focusedAssetData, setFocusedAssetData] = useState(null);

  const updateBannerData = useCallback((data) => {
    console.log("banner data new", data);
    setBannerData(data);
  }, []);

  const updateFocusedAssetData = useCallback((data) => {
    console.log("focused asset data new", data);
    setFocusedAssetData(data);
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
