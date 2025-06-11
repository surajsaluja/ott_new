import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import './index.css'

const AssetCard = ({ onEnterPress, onAssetFocus, assetData = {}, lastAssetChangeRef, lastRowChangeRef, dimensions }) => {
  const {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    ref,
    focused
  } = useAssetCard(assetData, dimensions, onAssetFocus, lastAssetChangeRef, lastRowChangeRef, onEnterPress);


  return (
    <div ref={ref} 
      className={`asset-wrapper ${focused ? "focused" : ""}`}
       style={{
        width: `${dimensions.itemWidth}px`,
        height: `${dimensions.itemHeight}px`,
        marginRight: '20px' // or whatever spacing you need
      }}>
      <div className={`card ${focused ? "focused" : ""}`}>
  {assetData.isSeeMore ? (
    <FocusableButton
      className={`seeMore`}
      text={`See More`}
      onEnterPress={onEnterPress}
      onFocus={onAssetFocus}
    />
  ) : shouldLoad ? (
    <>
      {/* Show shimmer placeholder while loading or if error occurs */}
      {(!isLoaded || hasError) && (
        <div className="shimmer-placeholder card-image">
          {hasError ? 'No Image available' : <p>{assetData.title}</p>}
        </div>
      )}
      
      {/* Show image only when loaded and no error */}
      {!hasError && isLoaded && (
        <>
          <div style={{background:`url(${imageUrl})`, backgroundSize:'cover', width: '100%', height: '100%'}}></div>
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
        </>
      )}
    </>
  ) : (
    <div className="shimmer-placeholder card-image" ref={imgRef}>
      Loading...
    </div>
  )}
</div>
    </div>
  );
};

export default AssetCard