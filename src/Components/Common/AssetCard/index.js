import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import './index.css'

const LEFT_RIGHT_DELAY = 300;
const UP_DOWN_DELAY = 500;

const AssetCard = ({ onEnterPress, onAssetFocus, assetData = {}, lastAssetChangeRef, lastRowChangeRef }) => {
  const {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  } = useAssetCard(assetData);

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
    <div ref={ref} className={`asset-wrapper ${focused ? "focused" : ""}`}>
      <div className={`card ${focused ? "focused" : ""}`}>
        {assetData.isSeeMore ? (
          <FocusableButton
            className={`seeMore`}
            text={`See More`}
            onEnterPress={onEnterPress}
            onFocus={onAssetFocus}
          />
        ) : shouldLoad && !hasError ? (
          <>
            {!isLoaded && <div className="shimmer-placeholder card-image"><p>{assetData.title}</p></div>}
            <img
              ref={imgRef}
              className={`card-image ${focused ? "focused" : ""} ${isLoaded ? "show" : "hide"
                }`}
              src={imageUrl}
              alt=""
              onLoad={handleLoad}
              onError={handleError}
            />
          </>
        ) : (
          <div className="shimmer-placeholder card-image" ref={imgRef}>No Image available</div>
        )}
      </div>
    </div>
  );
};

export default AssetCard