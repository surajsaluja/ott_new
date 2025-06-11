import {
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import {useContentRow, useMovieHomePage} from "./hooks/useContent";
import AssetCard from "../Common/AssetCard";
import "./Content.css";
import { useRef } from "react";
import { calculateDimensions } from "../../Utils";

const ContentRow = ({ title, onAssetPress, onFocus, data, focusKey, handleAssetFocus, lastRowChangeRef, playListDimensions }) => {
  const rowDimensions = data.length > 0 && playListDimensions 
    ? calculateDimensions(playListDimensions.height, playListDimensions.width)
    : calculateDimensions(null, null);
  const lastAssetChangeRef = useRef(Date.now());
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  } = useContentRow(focusKey, onFocus, handleAssetFocus);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        className={`contentRowWrapper ${hasFocusedChild ? "RowFocused" : ""}`}
        style={{ height: `${rowDimensions.containerHeight}px` }}

      >
        <div className="ContentRowTitle">{title}</div>
        <div className="ContentRowScrollingWrapper"
         ref={scrollingRowRef}
         style={{ height: `${rowDimensions.itemHeight}px` }}
         >
          <div className="ContentRowScrollingContent">
            {data.map((item, index) => (
              <AssetCard
                index={index}
                key={`${item.playListId}_${item.mediaID}_${index}`}
                assetData={item}
                onEnterPress={onAssetPress}
                onAssetFocus={onAssetFocus}
                lastAssetChangeRef = {lastAssetChangeRef}
                lastRowChangeRef={lastRowChangeRef}
                dimensions = {rowDimensions}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({ focusKey: focusKeyParam, onAssetFocus, data, setData, isLoading, onAssetPress,setIsLoading,loadMoreRows, handleAssetFocus, className : userClass }) => {
  const {
    ref,
    focusKey,
    onRowFocus,
    data : movieRowsData,
    loadMoreRef,
    isLoading : loadingSpinner
  } = useMovieHomePage(focusKeyParam, data, setData, isLoading, setIsLoading,loadMoreRows,handleAssetFocus);

  const lastRowChangeRef = useRef(Date.now());

  return (
    <FocusContext.Provider value={focusKey}>
      <div className={`ContentWrapper ${userClass ?? ''}`} id='homeContentWrapper'>
        <div className="ContentRow" ref={ref}>
          {movieRowsData && movieRowsData.map((item, index) => {
            const isThirdLast = index === movieRowsData.length - 3;
            return (
              <div key={index} ref={isThirdLast ? loadMoreRef : null}>
                {item.playlistItems.length > 0 && <ContentRow
                key={`${item.playListId}_${index}`}
                  title={item.playlistName}
                  onFocus={onRowFocus}
                  data={item.playlistItems}
                  onAssetPress={onAssetPress}
                  onAssetFocus = {onAssetFocus}
                  handleAssetFocus = {handleAssetFocus}
                  lastRowChangeRef = {lastRowChangeRef}
                  playListDimensions={
                    {
                      height: item.height ?? null,
                      width:item.width ?? null 
                    }
                  }
                />}
              </div>
            );
          })}
          {loadingSpinner && (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Content;
