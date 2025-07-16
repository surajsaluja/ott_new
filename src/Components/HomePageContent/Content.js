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
import useScreenSaver from "../ScreenSaver/Hooks/useScreenSaver";

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
  isCircular
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
    onAssetFocus,
  } = useContentRow(focusKey, onFocus, handleAssetFocus);

  const containerHeight = useMemo(() =>
    `${rowDimensions.containerHeight + (showTitle ? 70 : 0)}px`,
    [rowDimensions.containerHeight, showTitle]
  );

  const scrollingWrapperHeight = useMemo(() =>
    `${rowDimensions.itemHeight + (showTitle ? 85 : 15)}px`,
    [rowDimensions.itemHeight, showTitle]
  );

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        className={`contentRowWrapper ${hasFocusedChild ? "RowFocused" : ""}`}
        style={{ height: containerHeight }}
      >
        {rowDimensions && Object.keys(rowDimensions).length > 0 && <><div className="ContentRowTitle">{title}</div>
          <div
            className="ContentRowScrollingWrapper"
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
                  onAssetFocus={onAssetFocus}
                  lastAssetChangeRef={lastAssetChangeRef}
                  lastRowChangeRef={lastRowChangeRef}
                  dimensions={rowDimensions}
                  showTitle={showTitle}
                  isCircular={isCircular}
                />
              ))}
            </div>
          </div></>}
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({
  focusKey: focusKeyParam,
  onAssetFocus = () => { },
  data = [],
  setData = () => { },
  isLoading = false,
  onAssetPress = () => { },
  setIsLoading = () => { },
  loadMoreRows = () => { },
  handleAssetFocus = () => { },
  className: userClass = "",
  showTitle = false,
  isCircular = false,
  parentScrollingRef = null,
  isPagination = false,
  hasMoreRows = true,
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
    setData,
    isLoading,
    setIsLoading,
    loadMoreRows,
    handleAssetFocus,
    parentScrollingRef,
    isPagination,
    hasMoreRows
  );

  const lastRowChangeRef = useRef(Date.now());

  const renderRow = useCallback((item, index) => {
    return (<>
      <div key={index}>
        {item.playlistItems.length > 0 && (
          <ContentRow
            key={`${item.playListId}_${index}`}
            title={item.playlistName}
            onFocus={onRowFocus}
            data={item.playlistItems}
            onAssetPress={onAssetPress}
            onAssetFocus={onAssetFocus}
            handleAssetFocus={handleAssetFocus}
            lastRowChangeRef={lastRowChangeRef}
            showTitle={showTitle}
            isCircular={isCircular}
            playListDimensions={{
              height: item.height ?? null,
              width: item.width ?? null
            }}
          />
        )}
      </div>
    </>
    );
  }, [movieRowsData?.length, onRowFocus, onAssetPress, onAssetFocus, handleAssetFocus, showTitle, isCircular]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className={`ContentWrapper ${userClass ?? ''}`} id='homeContentWrapper'>
        <div className="ContentRow" ref={ref}>
          {movieRowsData?.map(renderRow)}
          {isPagination && hasMoreRows && (
            <div ref={loadMoreRef} style={{ height: '1px' }} />
          )}
          {loadingSpinner && <Spinner />}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Content;
