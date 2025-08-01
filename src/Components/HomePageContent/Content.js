import {
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import { useContentRow, useMovieHomePage } from "./hooks/useContent";
import AssetCard from "../Common/AssetCard";
import "./Content.css";
// import { useRef } from "react";
import { calculateDimensions } from "../../Utils";
import Spinner from "../Common/Spinner";
import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const ContentRow = ({
  title,
  onAssetPress,
  onFocus,
  data,
  focusKey,
  handleAssetFocus,
  lastRowChangeRef,
  playListDimensions,
  showTitle,
  isCircular,
  changeBanner,
  parentScrollingRef,
  isPlayListForTopContent = false,
   rowIndex,
  onRowFocus = () =>{}
}) => {

  const [rowDimensions, setRowDimensions] = useState({});

  useEffect(() => {
    const dim = data.length > 0 && playListDimensions ?
      calculateDimensions(playListDimensions.height, playListDimensions.width, showTitle)
      : calculateDimensions(null, null, showTitle);

    setRowDimensions(dim);
  }, [])

  const lastAssetChangeRef = useRef(Date.now());

  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
  } = useContentRow(focusKey,onRowFocus, rowIndex);

  const containerHeight = useMemo(() =>
    `${rowDimensions.containerHeight + (showTitle ? 70 : 0)}px`,
    [rowDimensions.containerHeight, showTitle]
  );

  const scrollingWrapperHeight = useMemo(() =>
    `${rowDimensions.itemHeight + (showTitle ? 85 : 15)}px`,
    [rowDimensions.itemHeight, showTitle]
  );

   const controls = useAnimation();

  const scrollToIndex = (index) => {
    const itemWidth = rowDimensions.itemWidth;
    const spacing = 20;
    const targetX = index * (itemWidth + spacing);

    controls.start({
      x: -targetX,
      transition: { type: "spring", stiffness: 300, damping: 35 }
    });
  };

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        className={`contentRowWrapper`}
        style={{ height: containerHeight }}
      >
        {rowDimensions && Object.keys(rowDimensions).length > 0 && <><div className="ContentRowTitle">{title}</div>
          <motion.div
              className="ContentRowScrollingContent"
              animate={controls}
              initial={{ x: 0 }} 
            ref={scrollingRowRef}
            style={{ height: scrollingWrapperHeight }}
          >
            <div className="ContentRowScrollingContent">
              {data.map((item, index) => (
                
                  <AssetCard
                    index={index}
                    key={`${item.playListId}_${item.mediaID}_${index}`}
                    focusKey={`${item.categoryID}_${item.playListId}_${item.mediaID}_${index}`}
                    assetData={item}
                    onEnterPress={onAssetPress}
                    // onAssetFocus={onAssetFocus}
                    lastAssetChangeRef={lastAssetChangeRef}
                    lastRowChangeRef={lastRowChangeRef}
                    dimensions={rowDimensions}
                    showTitle={showTitle}
                    isCircular={isCircular}
                    parentScrollingRef={parentScrollingRef}
                    // changeBanner = {changeBanner}
                    changeBanner={changeBanner}
                    isPlayListForTopContent={isPlayListForTopContent}
                    onAssetFocus={() => scrollToIndex(index)}
                  />
               
              ))}
            </div>
          </motion.div></>}
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({
  focusKey: focusKeyParam,
  data = [],
  isLoading = false,
  onAssetPress = () => { },
  loadMoreRows = () => { },
  className: userClass = "",
  showTitle = false,
  isCircular = false,
  parentScrollingRef = null,
  isPagination = false,
  hasMoreRows = true,
  changeBanner = false,
}) => {
  const {
    ref,
    focusKey,
    onRowFocus,
    data: movieRowsData,
    loadMoreRef,
    isLoading: loadingSpinner,
  } = useMovieHomePage(
    focusKeyParam,
    data,
    isLoading,
    loadMoreRows,
    isPagination,
    hasMoreRows
  );

  const lastRowChangeRef = useRef(Date.now());
  
   const controls = useAnimation();

  const rowHeights = 400; // Approximate height of each row
  const spacing = 20;

  const scrollToRow = useCallback((rowIndex) => {
    const offsetY = (rowIndex * rowHeights) + spacing;

    controls.start({
      y: -offsetY,
      transition: { type: "spring", stiffness: 200, damping: 30 }
    });
  }, []);

  const renderRow = useCallback((item, index) => {
    return (<>
      <div key={index}>
        {item.playlistItems.length > 0 && (
          <ContentRow
            key={`${item.playListId}_${index}`}
            rowIndex={index}
            title={item.playlistName}
            onFocus={onRowFocus}
            data={item.playlistItems}
            parentScrollingRef={parentScrollingRef}
            onAssetPress={onAssetPress}
            // onAssetFocus={onAssetFocus}
            // handleAssetFocus={handleAssetFocus}
            lastRowChangeRef={lastRowChangeRef}
            showTitle={showTitle}
            isCircular={isCircular}
            onRowFocus={scrollToRow}
            isPlayListForTopContent={item.isPlayListForTopContent}
            focusKey={`CONTENT_ROW_${item.playListId}_${index}`}
            changeBanner={changeBanner}
            playListDimensions={{
              height: item.height ?? null,
              width: item.width ?? null
            }}
          // changeBanner = {changeBanner}
          />
        )}
      </div>
    </>
    );
  }, [movieRowsData?.length, onRowFocus, onAssetPress, showTitle, isCircular]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className={`ContentWrapper ${userClass ?? ''}`} id='homeContentWrapper'>
        <div className="ScrollableArea">
        <motion.div
         className="ContentRow"
          id="contentRowWrapper" 
          ref={ref}
          animate={controls}
          initial={{ y: 0 }}
          >
          {movieRowsData?.map(renderRow)}
          {isPagination && hasMoreRows && (
            <div ref={loadMoreRef} style={{ height: '25px' }} />
          )}
          {loadingSpinner && <Spinner />}
        </motion.div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Content;
