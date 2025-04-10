import React,{useState} from "react";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { withRouter } from "react-router-dom";
import { useAsset, useContentRow, useMovieHomePage, useContentWithBanner } from "./hooks";
import FocusableButton from "../FocusableButton/FocusableButton";
import Banner from "../Banner";
import "./Content.css";

const Asset = ({ title, color, onEnterPress, onFocus, image, data = {} }) => {
  const {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  } = useAsset(image);

  const { ref, focused } = useFocusable({
    onEnterPress,
    onFocus:() => onFocus?.(data, ref.current),
    extraProps: { title, color, image, data },
  });

  return (
    <div ref={ref} className={`asset-wrapper ${focused ? "focused" : ""}`}>
      <div className={`card ${focused ? "focused" : ""}`}>
        {data.isSeeMore ? (
          <FocusableButton
            className={`seeMore`}
            text={`See More`}
            onEnterPress={onEnterPress}
            onFocus={onFocus}
          />
        ) : shouldLoad && !hasError ? (
          <>
            {!isLoaded && <div className="shimmer-placeholder card-image" />}
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
          <div className="shimmer-placeholder card-image" ref={imgRef} />
        )}
      </div>
    </div>
  );
};

const ContentRow = ({ title, onAssetPress, onFocus, data, focusKey, onAssetFocus }) => {
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus : internalOnAssetFocus,
  } = useContentRow(focusKey, onFocus);

  const handleFocus = (data, elRef) => {
    internalOnAssetFocus(data, elRef);
    onAssetFocus?.(data); // Notify parent (Banner)
  };

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
              <Asset
                index={index}
                title={item.title}
                key={item.mediaID}
                color={"blue"}
                image={item.webThumbnail}
                data={item}
                onEnterPress={onAssetPress}
                onFocus={handleFocus}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({ focusKey: focusKeyParam, history = null, onAssetFocus }) => {
  const {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data,
    loadMoreRef,
    isLoading,
  } = useMovieHomePage(focusKeyParam, history);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="ContentWrapper">
        <div className="ContentRow" ref={ref}>
          {data.map((item, index) => {
            const isThirdLast = index === data.length - 3;
            return (
              <div key={item.playlistId} ref={isThirdLast ? loadMoreRef : null}>
                <ContentRow
                  title={item.playlistName}
                  onFocus={onRowFocus}
                  data={item.playlistItems}
                  onAssetPress={onAssetPress}
                  onAssetFocus = {onAssetFocus}
                />
              </div>
            );
          })}
          {isLoading && (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

const ContentWithBanner = () =>{

 const onHeaderFocus = () =>{};
 
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    handleAssetFocus,
    focusedAssetData
  } = useContentWithBanner('',onHeaderFocus)

  return (
  <FocusContext.Provider value={currentFocusKey}>
  <div ref = {ref} className="content-with-banner">

    <Banner data={focusedAssetData} />
    <Content onAssetFocus={handleAssetFocus} />
    </div>
    </FocusContext.Provider>)
}

export default ContentWithBanner;
