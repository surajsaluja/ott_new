import React,{useState} from "react";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { useAsset, useContentRow, useMovieHomePage, useContentWithBanner } from "./hooks/useContent";
import FocusableButton from "../Common/FocusableButton";
import Banner from "../Banner";
import AssetCard from "../Common/AssetCard";
import "./Content.css";
import LoadingSkeleton from "./LoadingSkeleton";

const ContentRow = ({ title, onAssetPress, onFocus, data, focusKey, handleAssetFocus }) => {
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus
  } = useContentRow(focusKey, onFocus , handleAssetFocus);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div
        ref={ref}
        className={`contentRowWrapper ${hasFocusedChild ? "RowFocused" : ""}`}
      >
        <div className="ContentRowTitle">{title}</div>
        <div className="ContentRowScrollingWrapper" ref={scrollingRowRef}>
          <div className="ContentRowScrollingContent">
            {data.map((item, index) => (
              <AssetCard
                index={index}
                key={`${item.playListId}_${item.mediaID}_${index}`}
                assetData={item}
                onEnterPress={onAssetPress}
                onAssetFocus={onAssetFocus}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({ focusKey: focusKeyParam, onAssetFocus, data, setData, isLoading, setIsLoading,loadMoreRows, handleAssetFocus }) => {
  const {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data : movieRowsData,
    loadMoreRef,
    isLoading : loadingSpinner
  } = useMovieHomePage(focusKeyParam, data, setData, isLoading, setIsLoading,loadMoreRows,handleAssetFocus);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="ContentWrapper">
        <div className="ContentRow" ref={ref}>
          {movieRowsData && movieRowsData.map((item, index) => {
            const isThirdLast = index === movieRowsData.length - 3;
            return (
              <div key={index} ref={isThirdLast ? loadMoreRef : null}>
                <ContentRow
                key={`${item.playListId}_${index}`}
                  title={item.playlistName}
                  onFocus={onRowFocus}
                  data={item.playlistItems}
                  onAssetPress={onAssetPress}
                  onAssetFocus = {onAssetFocus}
                  handleAssetFocus = {handleAssetFocus}
                />
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

const ContentWithBanner = ({category,focusKey}) =>{

 const onHeaderFocus = () =>{};
 
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    handleAssetFocus,
    focusedAssetData,
    data,
    setData,
    isLoading,
    setIsLoading,
    banners,
    loadMoreRows
  } = useContentWithBanner(onHeaderFocus,category,focusKey);

  if(isLoading)
  {
    return (
      <LoadingSkeleton />
    )
  }

  return (
  <FocusContext.Provider value={currentFocusKey}>
  <div ref = {ref} className="content-with-banner">

    <Banner data={focusedAssetData} banners={banners} />
    <Content 
      onAssetFocus={handleAssetFocus} 
      data={data} 
      setData={setData} 
      isLoading={isLoading} 
      setIsLoading={setIsLoading}
      loadMoreRows={loadMoreRows}
      handleAssetFocus = {handleAssetFocus} 
      />
    </div>
    </FocusContext.Provider>)
}

export default ContentWithBanner;
