import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import './index.css'
import { useEffect } from "react";

const LEFT_RIGHT_DELAY = 300;
const UP_DOWN_DELAY = 500;

const AssetCard = ({ onEnterPress, onAssetFocus, assetData = {}, lastAssetChangeRef, lastRowChangeRef, dimensions }) => {
  const {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  } = useAssetCard(assetData, dimensions);

  const { ref, focused } = useFocusable({
    onEnterPress,
    onFocus: () => {
      onAssetFocus?.(ref.current, assetData);
    },
    onArrowPress: (direction) => {
      if (!focused) return false;
      if (direction === "left" || direction === "right") {
        return delayFocus(lastAssetChangeRef, LEFT_RIGHT_DELAY);
      }
      if (direction === 'up' || direction === 'down') {
        return delayFocus(lastRowChangeRef, UP_DOWN_DELAY);
      }
    },
    extraProps: { assetData },
  });

  useEffect(() => {
    if (!focused) return;
    const handleKeyUp = () => {
      console.log('key up');
      lastAssetChangeRef.current = 0;
      lastRowChangeRef.current = 0;
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [focused]);


  function delayFocus(ref, delay) {
    if (ref && typeof ref.current !== 'undefined') {
      const now = Date.now();
      if (now - ref.current < delay) {
        return false;
      }

      ref.current = now;
    }
    return true; // allow move
  }

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
      {!hasError && (
        <>
          <img
            ref={imgRef}
            className={`card-image ${focused ? "focused" : ""} show`}
            src={imageUrl}
            alt=""
            onLoad={handleLoad}
            onError={handleError}
          />
          {assetData.category === 'LiveTv' && assetData.countryLogo && assetData.name && (
            <div className="handlerInfo">
              <img src={assetData.countryLogo} alt="Country flag" />
              <p>{assetData.name}</p>
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