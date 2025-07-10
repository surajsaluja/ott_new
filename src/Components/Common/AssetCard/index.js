import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import "./index.css";
import React, { useMemo } from "react";

const gap = 40;
const defaultDimensions = {
  itemWidth: 300,
  itemHeight: 200,
  containerHeight: 200 + gap,
  displayImgType: "web",
};

const AssetCard = React.memo(({
  onEnterPress = () => {},
  onAssetFocus = () => {},
  assetData = {},
  lastAssetChangeRef = { current: 0 },
  lastRowChangeRef = { current: 0 },
  dimensions = defaultDimensions,
  showTitle = false,
  isCircular = false,
}) => {
  const {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    ref,
    focused,
    cachedImage,
  } = useAssetCard(assetData, dimensions, onAssetFocus, lastAssetChangeRef, lastRowChangeRef, onEnterPress);

  const borderRadius = isCircular ? "50%" : "0.5em";

  const imgStyles = useMemo(() => ({
    display: isLoaded ? "block" : "none",
  }), [isLoaded]);

  const wrapperStyles = useMemo(() => ({
    width: `${dimensions.itemWidth}px`,
    height: `${dimensions.itemHeight}px`,
    borderRadius,
  }), [dimensions.itemWidth, dimensions.itemHeight, borderRadius]);

  const containerStyles = useMemo(() => ({
    width: `${dimensions.itemWidth}px`,
    maxWidth: `${dimensions.itemWidth}px`,
    height: `${dimensions.itemHeight + (showTitle ? 70 : 0)}px`,
  }), [dimensions.itemWidth, dimensions.itemHeight, showTitle]);

  return (
    <div className="asset" style={containerStyles}>
      <div
        ref={ref}
        className={`asset-wrapper ${focused ? "focused" : ""}`}
        style={wrapperStyles}
      >
        <div className={`card ${focused ? "focused" : ""}`} style={{ borderRadius }}>
          {assetData.isSeeMore ? (
            <FocusableButton
              className="seeMore"
              text="See More"
              onEnterPress={onEnterPress}
              onFocus={onAssetFocus}
            />
          ) : shouldLoad ? (
            <div className="image-wrapper">
              {!hasError && (
                <img
                  ref={imgRef}
                  className={`card-image ${focused ? "focused" : ""}`}
                  src={cachedImage ? cachedImage.src : imageUrl}
                  alt={assetData.title}
                  loading="lazy"
                  onLoad={!cachedImage ? handleLoad : undefined}
                  onError={!cachedImage ? handleError : undefined}
                  style={imgStyles}
                />
              )}

              {(!isLoaded || hasError) && (
                <div className="shimmer-placeholder">
                  <span className="placeholder-text">
                    {hasError ? "No Image available" : assetData.title}
                  </span>
                </div>
              )}

              {assetData.category === "LiveTv" && assetData.countryLogo && (
                <div className="handlerInfo">
                  <img src={assetData.countryLogo} alt="Country flag" />
                  <p>{assetData.name}</p>
                </div>
              )}

              {assetData.category === "LiveTvSchedule" && assetData.timeSlot && (
                <div className="LiveTvScheduleInfo">
                  <div className="left">
                    {assetData.isNowPlaying && <span className="nowPlaying">Now Playing</span>}
                    <p>{assetData.programmeName}</p>
                  </div>
                  <div className="right">
                    {!assetData.isNowPlaying && <p>{assetData.timeSlot}</p>}
                    {assetData.isNowPlaying && <p className="liveSchedule">LIVE</p>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="shimmer-placeholder" ref={imgRef}>
              <span className="placeholder-text">Loading...</span>
            </div>
          )}
        </div>
      </div>
      {showTitle && <p className="assetTitle">{assetData.title}</p>}
    </div>
  );
});

export default AssetCard;