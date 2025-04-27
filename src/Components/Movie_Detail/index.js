import React from 'react'
import useMovieDetail from './Hooks/useMovieDetail';
import FocusableButton from '../Common/FocusableButton';
import {
  FocusContext
} from "@noriginmedia/norigin-spatial-navigation";
import { useParams } from 'react-router-dom';

import './index.css';
function Movie_Detail() {
  const { mediaId } = useParams();
  const {
    ref,
    currentFocusKey,
    mediaDetail,
    onMovieWatchPress,
    onTrailerWatchPress,
    isLoading
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
      className="movie-detail-page-poster"
      style={{
        backgroundImage: mediaDetail.fullPageBanner
          ? `url(${mediaDetail.fullPageBanner})`
          : "none",
      }}
    ></div>
    <div className="overlay-detail overlay-detail-ltr"></div>

    <div className="content-detail">
      <div className="details">
        {mediaDetail.title && <h1 className="title-detail">{mediaDetail.title}</h1>}
        <div className="info-detail">
          {mediaDetail.releasedYear && <><span>{mediaDetail.releasedYear}</span> •</>} 
          {mediaDetail.genre && <><span>{mediaDetail.genre}</span> •</>}
          {mediaDetail.duration && <><span>{mediaDetail.duration}</span> •</>}
          {mediaDetail.rating && <><span>⭐ {mediaDetail.rating}</span></>}
        </div>
        {mediaDetail.description && <p className="description-detail">{mediaDetail.description}</p>}

        <FocusContext.Provider value={currentFocusKey}>
          <div ref={ref} className="buttons-detail">
            <FocusableButton
              className="detail-play-button"
              focusClass="detail-play-button-focus"
              text={"Watch Movie"}
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
          </div>
        </FocusContext.Provider>
      </div>
    </div>
  </>
)}

    </div>
  );
}


export default Movie_Detail