import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import React, { useRef, useCallback, useState, useEffect } from "react";
import "./index.css";
import AssetCard from "../AssetCard";
import Spinner from "../Spinner";

function FullPageAssetContainer({
  assets = [],
  itemsPerRow = 4,
  onAssetPress = () => {},
  title = "",
  focusKey,
  isLoading = false,
}) {
  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusable: assets.length > 0,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: true,
  });

  const assetScrollingRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    itemWidth: 337, // Default fallback
    itemHeight: 200,
    aspectRatio: 3 / 2,
  });

  // Calculate dimensions based on container width
  useEffect(() => {
    const calculateDimensions = () => {
      if (assetScrollingRef.current) {
        const containerWidth = assetScrollingRef.current.offsetWidth - 10;
        const gap = 20;
        const itemWidth = (containerWidth - itemsPerRow * gap) / itemsPerRow;

        setDimensions({
          itemWidth,
          itemHeight: 'auto', // Maintain 3:2 aspect ratio
          aspectRatio: 3 / 2,
          containerHeight: "auto",
          displayImgType: "web",
        });
      }
    };

    calculateDimensions();

    const resizeObserver = new ResizeObserver(calculateDimensions);
    const element = assetScrollingRef.current;

    if (element && resizeObserver.observe) {
      resizeObserver.observe(element);
    } else {
      window.addEventListener("resize", calculateDimensions);
    }

    return () => {
      resizeObserver.disconnect?.();
      window.removeEventListener("resize", calculateDimensions);
    };
  }, []);

  const onAssetFocus = useCallback(
    (el) => {
      assetScrollingRef.current.scrollTo({
        top: el?.offsetTop - assetScrollingRef?.current?.offsetTop - 20,
        behavior: "smooth",
      });
    },
    [assetScrollingRef]
  );
  

  return (
    <>
      {!isLoading && (
        <FocusContext.Provider value={currentFocusKey}>
          <div ref={ref} className="asset-container">
            {title && <p className="asset-container-title">{title}</p>}
            <div className={"asset-scrolling-wrapper"} ref={assetScrollingRef}>
              {
                (assets.length > 0 || isLoading) ? (
                assets.map((asset, idx) => (
                  <AssetCard
                    key={`${asset.id}_${idx}`}
                    focusKey={`${asset.id}_${idx}`}
                    assetData={asset}
                    index={idx}
                    onEnterPress={() => onAssetPress(asset)}
                    onAssetFocus={onAssetFocus}
                    dimensions={dimensions}
                    showTitle={true}
                  />
                ))
              ): (
                <div className="error-wrapper">{isLoading ? <Spinner /> : 'No Content Found'}</div>)
            }
              
            </div>
          </div>
        </FocusContext.Provider>
      )}
    </>
  );
}

export default FullPageAssetContainer;
