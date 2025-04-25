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
      {isLoading ? (
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
          <div className="overlay"></div>
  
          <div className="content">
            <div className="details">
              <h1 className="title">{mediaDetail.title}</h1>
              <p className="description">{mediaDetail.shortDescription}</p>
              <div className="info">
                <span>{mediaDetail.releasedYear}</span> •{" "}
                <span>{mediaDetail.genre}</span> •{" "}
                <span>⭐ {mediaDetail.rating}</span>
              </div>
  
              <FocusContext.Provider value={currentFocusKey}>
                <div ref={ref} className="buttons">
                  <FocusableButton
                    className="detail-play-button"
                    focusClass="detail-play-button-focus"
                    text={"Watch Movie"}
                    onEnterPress={() =>
                      onMovieWatchPress(`${mediaDetail.preview_url}`)
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