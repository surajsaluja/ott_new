import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import useAssetCard from "./hooks/useAssetCard";
import FocusableButton from "../FocusableButton";
import './index.css'

const AssetCard = ({onEnterPress, onAssetFocus, assetData = {} }) => {
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
      onFocus:() => {
        onAssetFocus?.(ref.current, assetData);
      },
      extraProps: {assetData},
    });
  
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
                className={`card-image ${focused ? "focused" : ""} ${
                  isLoaded ? "show" : "hide"
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