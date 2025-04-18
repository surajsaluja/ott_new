import React,{useState} from "react";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { withRouter } from "react-router-dom";
import { useAsset, useContentRow, useMovieHomePage, useContentWithBanner } from "./hooks/useContent";
import FocusableButton from "../Common/FocusableButton";
import Banner from "../Banner";
import "./Content.css";

const Asset = ({ title, color, onEnterPress, onFocus, image, data = {},setAssetData }) => {
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
    onFocus:() => {
      onFocus?.(ref.current);
      setAssetData(data);
    },
    onBlur:()=>setAssetData(null),
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

const ContentRow = ({ title, onAssetPress, onFocus, data, focusKey, setAssetData }) => {
  const {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  } = useContentRow(focusKey, onFocus);

  // const handleFocus = (data, elRef) => {
  //   internalOnAssetFocus(data, elRef);
  //   onAssetFocus?.(data); // Notify parent (Banner)
  // };

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
                onFocus={onAssetFocus}
                setAssetData={setAssetData}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

const Content = ({ focusKey: focusKeyParam, history = null, onAssetFocus, data, setData, isLoading, setIsLoading,setAssetData }) => {
  const {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data : movieRowsData,
    loadMoreRef,
    isLoading : loadingSpinner,
  } = useMovieHomePage(focusKeyParam, history, data, setData, isLoading, setIsLoading);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="ContentWrapper">
        <div className="ContentRow" ref={ref}>
          {movieRowsData && movieRowsData.map((item, index) => {
            const isThirdLast = index === movieRowsData.length - 3;
            return (
              <div key={item.playlistId} ref={isThirdLast ? loadMoreRef : null}>
                <ContentRow
                  title={item.playlistName}
                  onFocus={onRowFocus}
                  data={item.playlistItems}
                  onAssetPress={onAssetPress}
                  onAssetFocus = {onAssetFocus}
                  setAssetData={setAssetData}
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

const ContentWithBanner = () =>{

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
    setFocusedAssetData
  } = useContentWithBanner('',onHeaderFocus)

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
      setAssetData={setFocusedAssetData} 
      />
    </div>
    </FocusContext.Provider>)
}

export default ContentWithBanner;
