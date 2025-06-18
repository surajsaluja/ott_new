import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import './index.css'

const gap = 40;
const defaultDimensions = {
  itemWidth: 300,
  itemHeight: 200,
  containerHeight: 200 + gap,
  displayImgType: 'web'
};

const AssetCard = ({
  onEnterPress = () => { },
  onAssetFocus = () => { },
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
    focused
  } = useAssetCard(assetData, dimensions, onAssetFocus, lastAssetChangeRef, lastRowChangeRef, onEnterPress);


  return (
    <div className={'asset'}
    style={{
      width: `${dimensions.itemWidth}px`,
      maxWidth: `${dimensions.itemWidth}px`,
      height: `${dimensions.itemHeight + (showTitle ? 70 : 0)}px`
    }}>
    <div ref={ref}
      className={`asset-wrapper ${focused ? "focused" : ""}`}
      style={{
        width: `${dimensions.itemWidth}px`,
        height: `${dimensions.itemHeight}px`,
        borderRadius: `${isCircular ? '50%' : '0.5em'}`
      }}>
      <div className={`card ${focused ? "focused" : ""}`}
      style={{borderRadius: `${isCircular ?'50%' : '0.5em'}`}}
      >
        {assetData.isSeeMore ? (
          <FocusableButton
            className={`seeMore`}
            text={`See More`}
            onEnterPress={onEnterPress}
            onFocus={onAssetFocus}
          />
        ) : shouldLoad ? (
          <>
            <div className="image-wrapper">
              {!hasError && (
                <img
                  ref={imgRef}
                  className={`card-image ${focused ? 'focused' : ''}`}
                  src={imageUrl}
                  alt={assetData.title}
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{
                    display: isLoaded ? 'block' : 'none',
                  }}
                />
              )}

              {/* Show placeholder text only when loading or error */}
              {(!isLoaded || hasError) && (
                <div
                  className="shimmer-placeholder">
                  <span className="placeholder-text">{hasError ? 'No Image available' : assetData.title}</span>
                </div>
              )}
              {assetData.category === 'LiveTv' && assetData.countryLogo && assetData.name && (
                  <div className="handlerInfo">
                    <img src={assetData.countryLogo} alt="Country flag" />
                    <p>{assetData.name}</p>
                  </div>
                )}
                {assetData.category === 'LiveTvSchedule' && assetData.timeSlot && (
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

          </>
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
};

export default AssetCard