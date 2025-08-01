import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import "./index.css";
import React, { useMemo } from "react";

const defaultDimensions = {
  itemWidth: 300,
  itemHeight: 200,
  containerHeight: 240,
  displayImgType: "web",
};

const AssetCard = (props) => {
  const {
    onEnterPress = () => { },
    onAssetFocus = () => { },
    assetData = {},
    lastAssetChangeRef = { current: 0 },
    lastRowChangeRef = { current: 0 },
    dimensions = defaultDimensions,
    showTitle = false,
    focusKey,
    isCircular = false,
    changeBanner = false,
    parentScrollingRef = null,
    isPlayListForTopContent = false,
    index
  } = props;

  const {
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    ref,
    focused,
    cachedImage,
  } = useAssetCard(
    assetData,
    dimensions,
    onAssetFocus,
    lastAssetChangeRef,
    lastRowChangeRef,
    onEnterPress,
    focusKey,
    changeBanner,
    parentScrollingRef
  );

  const borderRadius = isCircular ? "50%" : "0.5em";
  // const topTenImageUrl = `https://images.kableone.com/Images/Top10/img1/`;
  // const topTenFillUrl = `https://images.kableone.com/Images/Top10/filledimage/`

  const containerStyles = useMemo(() => ({
    width: `${dimensions.itemWidth}px`,
    height: `${dimensions.containerHeight}px`,
    marginLeft: isPlayListForTopContent ? '33px' : 0,
  }), [dimensions]);

  const imageWrapperStyle = useMemo(() => ({
    width: `${dimensions.itemWidth}px`,
    height: `${dimensions.itemHeight}px`,
    // position: "relative",
    overflow: "hidden",
    borderRadius,
  }), [dimensions, borderRadius]);

  const seeMoreStyles = useMemo(() => ({
    width: `${dimensions.itemWidth}px`,
    height: `${dimensions.itemHeight}px`,
    // position: "relative",
    overflow: "hidden",
    // borderRadius,
  }), [dimensions, borderRadius]);

  const imageStyles = useMemo(() => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: isLoaded ? "block" : "none",
    borderRadius,
  }), [isLoaded, borderRadius]);

  const cardWrapperStyles = useMemo(() => ({
    borderRadius,
    width: "100%",
    padding: isPlayListForTopContent ? 0 : '2px'
  }), [borderRadius]);

  return (
    <>
      <div className="asset" style={containerStyles}>
         <div className="asset-relative-wrapper" style={{ position: "relative"}}>
    {isPlayListForTopContent && (
      <div className="top-ten-playlist">
        <img src={focused? require(`../../../assets/top_10_images/filled/${index+1}.png`) : require(`../../../assets/top_10_images/unfilled/${index+1}.png`)} />
      </div>
    )}
   
    
        <div
          ref={ref}
          className={`asset-wrapper ${focused ? "focused" : ""}`}
          style={cardWrapperStyles}
        >
          <div className={`card ${focused ? "focused" : ""}`} style={{ borderRadius }}>
            {assetData.isSeeMore ? (
              <FocusableButton
                className="seeMore"
                text="See More"
                onEnterPress={onEnterPress}
                onFocus={onAssetFocus}
                customStyles={seeMoreStyles}
              />
            ) : shouldLoad ? (
              <div className="image-wrapper" style={imageWrapperStyle}>
                {!hasError && (
                  <img
                    className={`card-image ${focused ? "focused" : ""}`}
                    src={cachedImage ? cachedImage.src : imageUrl}
                    alt={assetData.title}
                    loading="lazy"
                    onLoad={!cachedImage ? handleLoad : undefined}
                    onError={!cachedImage ? handleError : undefined}
                    style={imageStyles}
                  />
                )}

                {(!isLoaded || hasError) && (
                  <div className="shimmer-placeholder" style={imageWrapperStyle}>
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
              <div className="shimmer-placeholder" style={imageWrapperStyle}>
                <span className="placeholder-text">Loading...</span>
              </div>
            )}
          </div>
        </div>
        </div>
        {showTitle && <p className="assetTitle">{assetData.title}</p>}
      </div>
    </>
  );
};

export default AssetCard;
