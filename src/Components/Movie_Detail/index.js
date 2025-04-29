import React, { useState } from 'react'
import useMovieDetail from './Hooks/useMovieDetail';
import FocusableButton from '../Common/FocusableButton';
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import {
  FocusContext
} from "@noriginmedia/norigin-spatial-navigation";
import { useParams } from 'react-router-dom';
import { formatTime } from '../../Utils';
import BottomDrawer from '../Common/BottomDrawer';
import './index.css';
import FullPageAssetContainer from '../Common/FullPageAssetContainer';

function Movie_Detail() {
  const { mediaId } = useParams();
  const {
    ref,
    currentFocusKey,
    mediaDetail,
    onMovieWatchPress,
    onTrailerWatchPress,
    isLoading,
    handleBottomDrawerOpen,
    isDrawerOpen,
    handleBottomDrawerClose,
    tabs,
    bottomDrawerActiveTab,
    setBottomDrawerActiveTab,
    relatedItems
  } = useMovieDetail(mediaId);


  return (
    <div className="movie-detail-page">
      {isLoading || !mediaDetail ? (
        <div className="details-shimmer shimmer-wrapper">
          <div className="shimmer-content-container">
            <div className="shimmer title"></div>
            <div className="shimmer description"></div>
            <div className="shimmer info"></div>
            <div className="shimmer buttons"></div>
          </div>
          <div className='shimmer-image-container'>
            <div className='shimmer image'></div>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`movie-detail-page-poster ${mediaDetail.fullPageBanner ? 'bg-image-found' : 'bg-image-not-found'}`}
            style={{
              backgroundImage: mediaDetail.fullPageBanner
                ? `url("${mediaDetail.fullPageBanner}")`
                : "none",
            }}
          ></div>
          <div className="overlay-detail overlay-detail-ltr"></div>

          <div className="content-detail">
            <div className="details">
              {mediaDetail.title && <h1 className="title-detail">{mediaDetail.title}</h1>}
              <div className="info-detail">
                {mediaDetail?.releasedYear && <span><i><MdOutlineDateRange /></i>{mediaDetail?.releasedYear}</span>}
                {mediaDetail?.rating && <span><i><MdStarRate /></i>{mediaDetail?.rating}</span>}
                {mediaDetail?.duration && <span><i><MdOutlineTimer /></i>{formatTime(mediaDetail?.duration)}</span>}
                {mediaDetail?.ageRangeId && <span><i><GiVibratingShield /></i>{mediaDetail?.ageRangeId}</span>}
                {mediaDetail?.cultures && <span>{mediaDetail?.cultures}</span>}
              </div>
              {mediaDetail.description && <p className="description-detail">{mediaDetail.description}</p>}

              <FocusContext.Provider value={currentFocusKey}>
                <div ref={ref}>
                  <div className="buttons-detail">
                    <FocusableButton
                      className="detail-play-button"
                      focusClass="detail-play-button-focus"
                      text={"Watch Movie"}
                      focuskey={'detailBtnWatchMovie'}
                      onEnterPress={() =>
                        onMovieWatchPress(`${mediaDetail.mediaUrl}`)
                      }
                    />
                    <FocusableButton
                      className="detail-play-button"
                      focusClass="detail-play-button-focus"
                      text={"Watch Trailer"}
                      onEnterPress={() =>
                        onTrailerWatchPress(`${mediaDetail.preview_url}`)
                      }
                    />
                    <FocusableButton
                      className="detail-play-button"
                      focusClass="detail-play-button-focus"
                      text={"Continue Watching"}
                      onEnterPress={() =>
                        onTrailerWatchPress(`${mediaDetail.preview_url}`)
                      }
                    />
                    <FocusableButton
                      className="detail-play-button"
                      focusClass="detail-play-button-focus"
                      text={"Add To Favourutes"}
                      onEnterPress={() =>
                        onTrailerWatchPress(`${mediaDetail.preview_url}`)
                      }
                    />
                    <div className={'buttons-bottom-dummy'}>
                      {tabs.map((el, idx) =>
                        idx === 0 ? (
                          <FocusableButton
                            key={`${el.focusKey}_dummy`}
                            text={el.name}
                            className={'btn-bottom-detail'}
                            focusClass={'btn-bottom-detail-focused'}
                            focuskey={`${el.focusKey}_dummy`}
                            onEnterPress={el.action}
                            onFocus={handleBottomDrawerOpen}
                          />
                        ) : (
                          <div
                            key={`${el.focusKey}_nonfocus`}
                            className={'btn-bottom-detail'}
                          >
                            {el.name}
                          </div>
                        )
                      )}

                    </div>
                  </div>
                </div>
              </FocusContext.Provider>
            </div>
          </div>
        </>
      )}

      {isDrawerOpen && <BottomDrawer isOpen={isDrawerOpen} onClose={handleBottomDrawerClose}>
        <div className='bottom-content-detail'>
          <div className='bottomDrawer-detail-tabs'>
            {tabs.map((el) => (
              <FocusableButton
                key={el.focusKey}
                text={el.name}
                className={'btn-bottomDrawer-detail-tab'}
                focusClass={'btn-bottomDrawer-detail-tab-focused'}
                focuskey={el.focusKey}
                onEnterPress={() => {
                  setBottomDrawerActiveTab(el.id);
                }}
              />
            ))}


          </div>
          <div className='bottomDrawer-detail-assets-container'>
            {bottomDrawerActiveTab === 1 && <FullPageAssetContainer category="similar" />}
            {bottomDrawerActiveTab === 2 && (<FullPageAssetContainer
              assets={relatedItems}
              onAssetPress={(asset) => console.log('Related item clicked', asset)}
            />)}
            {bottomDrawerActiveTab === 3 && <p>Cast & Crew</p>}
          </div>
        </div>
      </BottomDrawer>}


    </div>
  );
}

export default Movie_Detail