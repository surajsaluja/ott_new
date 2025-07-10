import React, { useCallback, useMemo } from "react";
import LoadingSkeleton from "../Common/MovieHomeSkeleton/LoadingSkeleton";
import { useContentWithBanner } from "./Hooks";
import { FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import Banner from "../Banner/MovieBanner";
import Content from "../HomePageContent/Content";

const ContentWithBanner = ({ category, focusKey }) => {
  const onHeaderFocus = useCallback(() => {}, []);

  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    handleAssetFocus,
    focusedAssetData,
    data,
    setData,
    isLoading,
    setIsLoading,
    banners,
    loadMoreRows,
    onAssetPress,
    isBannerLoadedRef
  } = useContentWithBanner(onHeaderFocus, category, focusKey);

  const contextValue = useMemo(() => currentFocusKey, [currentFocusKey]);

  const assetContentStyle = useMemo(
    () => ({
      position: "absolute",
      height: focusedAssetData == null ? "40vh" : "55vh",
      bottom: 0,
      width: "100%",
    }),
    [focusedAssetData]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <FocusContext.Provider value={contextValue}>
      <div
        ref={ref}
        className="content-with-banner"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <Banner
          data={focusedAssetData}
          banners={banners}
          focusKey={"BANNER_FOCUS_KEY"}
          isBannerLoadedRef={isBannerLoadedRef}
        />

        <div className="assetContent" style={assetContentStyle}>
          <Content
            onAssetFocus={handleAssetFocus}
            data={data}
            setData={setData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            loadMoreRows={loadMoreRows}
            handleAssetFocus={handleAssetFocus}
            onAssetPress={onAssetPress}
          />
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default React.memo(ContentWithBanner);
