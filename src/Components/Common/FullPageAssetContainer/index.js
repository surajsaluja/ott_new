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
  loadMoreRows = () =>{},
  hasMore = false,
  isPagination = false,
  handleAssetFocus = ()=>{},
  changeBanner = false
}) {
  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusable: assets.length > 0 && !isLoading,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: true,
  });

  const assetScrollingRef = useRef(null);
  const loadingMoreRef = useRef(false); // Tracks if a load is in progress
  const loadMoreTriggerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    itemWidth: 337, // Default fallback
    itemHeight: 200,
    aspectRatio: 3 / 2,
  });

  
const debouncedLoadMore = useCallback(() => {
  if (loadingMoreRef.current || !hasMore) return;

  loadingMoreRef.current = true;
  loadMoreRows().finally(() => {
    loadingMoreRef.current = false;
  });
}, [loadMoreRows, hasMore]);


  // Calculate dimensions based on container width
  useEffect(() => {
    const calculateDimensions = () => {
      if (assetScrollingRef.current) {
        const containerWidth = assetScrollingRef.current.offsetWidth - 10;
        const gap = 20;
        const itemWidth = (containerWidth - itemsPerRow * gap) / itemsPerRow;
        // const itemWidth  = 380

        setDimensions({
          itemWidth,
          itemHeight: itemWidth / (16/9) , // Maintain 3:2 aspect ratio
          aspectRatio: 16 / 9,
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

  useEffect(() => {
    if (!isPagination || !hasMore || !loadMoreTriggerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          debouncedLoadMore();
        }
      },
      {
        root: assetScrollingRef.current,
        rootMargin: '0px 0px 300px 0px', // trigger before bottom
        threshold: 0.01
      }
    );

    const trigger = loadMoreTriggerRef.current;
    observer.observe(trigger);

    return () => {
      if (trigger) observer.unobserve(trigger);
    };
  }, [isPagination, hasMore, debouncedLoadMore, assets]);



  const onAssetFocus = useCallback(
    (el,data) => {
      assetScrollingRef.current.scrollTo({
        top: el?.offsetTop - assetScrollingRef?.current?.offsetTop - 20,
        behavior: "smooth",
      });
      handleAssetFocus(data);
    },
    [assetScrollingRef]
  );
  

  return (
        <FocusContext.Provider value={currentFocusKey}>
          <div ref={ref} className="asset-container">
            {title && <p className="asset-container-title">{title}</p>}
            <div className={"asset-scrolling-wrapper"} id="full-page-asset-scroll-container" ref={assetScrollingRef}>
              {
                (assets.length > 0) ? (
                assets.map((asset, idx) => (
                  <AssetCard
                    key={`${asset.mediaID}_${idx}`}
                    focusKey={`${asset.mediaID}_${idx}`}
                    assetData={asset}
                    index={idx}
                    onEnterPress={() => onAssetPress(asset)}
                    onAssetFocus={null}
                    dimensions={dimensions}
                    showTitle={true}
                    changeBanner = {changeBanner}
                    parentScrollingRef = {assetScrollingRef}
                  />
                ))
              ): (
                <div className="error-wrapper">{isLoading ? <Spinner /> : 'No Content Found'}</div>)
            }
             {isPagination && hasMore && (
                <div ref={loadMoreTriggerRef} style={{ height: '1px' }} />
              )}
              
            </div>
          </div>
        </FocusContext.Provider>
  );
}

export default FullPageAssetContainer;
