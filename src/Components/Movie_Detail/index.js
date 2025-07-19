import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { useParams } from 'react-router-dom';
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate, MdAdd, MdError } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import { formatTime } from "../../Utils";
import useMediaDetail from "./Hooks/useMediaDetail";
import BottomDrawer from "../Common/BottomDrawer";
import './index.css'
import TabbedComponent from "../Common/TabbedComponent";
import FocusableButtonIconTooltip from "../Common/FocusableButtonIconTooltip";
import { MdOutlineRestartAlt, MdMovie } from "react-icons/md";
import { IoHeartSharp } from "react-icons/io5";
import { FaPlay } from "react-icons/fa6";

function Movie_Detail() {
    const { categoryId, mediaId } = useParams();
    const {
        ref,
        btnControlsFocusKey,
        isLoading,
        mediaDetail,
        isDrawerOpen,
        tabs,
        isDrawerContentReady,
        isError,
        errorMessage,
        handleBottomDrawerOpen,
        handleBottomDrawerClose,
        isMediaFavourite,
        showResumeBtn,
        updateMediaWishlistStatus,
        watchMovie,
        handleBackPressed,
        isMediaPublished,
        isVideoLoaded,
        isPlaying,
        videoPlayerRef,
        videoRef
    } = useMediaDetail(mediaId, categoryId, 'MOVIE_DETAIL_PAGE');


    return (<FocusContext.Provider value={btnControlsFocusKey}>

        <div className="movie-detail-page" ref={ref}>
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
                (isError) ? (<div className="error-container">
                    <div className="error-icon">
                        <MdError />
                    </div>
                    <div className="error-message">
                        {errorMessage}
                    </div>
                    <FocusableButton
                        text="Return Back"
                        focuskey={'DETAIL_ERROR_BUTTON'}
                        className="btn-error-return"
                        focusClass="btn-error-focused"
                        onEnterPress={handleBackPressed}
                    />
                </div>) : (<>
                    <div
                        className={`movie-detail-page-poster ${mediaDetail.fullPageBanner ? 'bg-image-found' : 'bg-image-not-found'}`}
                        style={{
                            backgroundImage: mediaDetail.fullPageBanner && !isVideoLoaded
                                ? `url("${mediaDetail.fullPageBanner}")`
                                : "none",
                        }}
                    >
                        <video
                            key="detail-video"
                            ref={videoRef}
                            autoPlay={false}
                            // poster={displayAsset.fullPageBanner}
                            playsInline
                            style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
                        />
                    </div>
                    <div className={` overlay-detail ${!isVideoLoaded ? 'overlay-detail-ltr' : 'overlay-bottom-gradient'}`}></div>

                    <div className="content-detail">
                        <div className={`details ${isVideoLoaded ? 'videoLoaded' : ''}`}>
                            {mediaDetail.webSeriesId != null && mediaDetail.webSeriesName != null ? (
                                <>
                                    {mediaDetail.webSeriesName && <h1 className="title-detail">{mediaDetail.webSeriesName}</h1>}
                                    <div className="details-episodedata">
                                        <div className="seriesNumber-detail">
                                        {mediaDetail.smiSubtitleUrl && <span className="">{mediaDetail.smiSubtitleUrl}</span>}
                                        </div>
                                        <span className="episode-detail-seprator"></span>
                                        {mediaDetail.title && <span className="seriesName-detail">{mediaDetail.title}</span>}
                                    </div>
                                </>
                            ) : (
                                mediaDetail.title && <h1 className="title-detail">{mediaDetail.title}</h1>
                            )}
                            {!isVideoLoaded && <div className="info-detail">
                                {mediaDetail?.releasedYear && <span><i><MdOutlineDateRange /></i>{mediaDetail?.releasedYear}</span>}
                                {/* {mediaDetail?.rating && <span><i><MdStarRate /></i>{mediaDetail?.rating}</span>} */}
                                {mediaDetail?.duration && isMediaPublished && <span><i><MdOutlineTimer /></i>{formatTime(mediaDetail?.duration)}</span>}
                                {mediaDetail?.ageRangeId && <span><i><GiVibratingShield /></i>{`${mediaDetail?.ageRangeId}+`}</span>}
                                {mediaDetail?.cultures && <span>{mediaDetail?.cultures}</span>}
                            </div>}
                            {!isVideoLoaded && <p className="description-detail">{mediaDetail.description}</p>}
                            {mediaDetail &&
                                <div className="buttons-detail">
                                    {isMediaPublished && <FocusableButton
                                        key={'detail_watch'}
                                        icon={<FaPlay />}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={showResumeBtn ? `Resume` : `Watch Now`}
                                        onEnterPress={() => { watchMovie(false, showResumeBtn) }}
                                    />}
                                    {isMediaPublished && showResumeBtn && <FocusableButtonIconTooltip
                                        icon={<MdOutlineRestartAlt />}
                                        text={'Start Over'}
                                        onEnterPress={() => { watchMovie(false, false) }}
                                        className="round-focusable-button"
                                    />}
                                    {mediaDetail.trailerUrl && (isMediaPublished ? (<FocusableButtonIconTooltip
                                        icon={<MdMovie />}
                                        text={'Watch Trailer'}
                                        onEnterPress={() => { watchMovie(true, false) }}
                                        className="round-focusable-button"
                                    />) : (<FocusableButton
                                        key={'detail_watch_trailer'}
                                        icon={<FaPlay />}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={'Watch Trailer'}
                                        onEnterPress={() => { watchMovie(true, false) }}
                                    />))}
                                    <FocusableButtonIconTooltip
                                        icon={isMediaFavourite ? <IoHeartSharp /> : <MdAdd />}
                                        text={isMediaFavourite ? 'Remove From Wishlist' : 'Add To Wishlist'}
                                        onEnterPress={updateMediaWishlistStatus}
                                        className="round-focusable-button"
                                    />
                                </div>


                            }
                        </div>
                    </div>
                    <div className="details-dummy-buttons-wrapper">
                        {tabs.map((el, idx) => (
                            idx == 0 ? (<FocusableButton
                                key={'Bottom 1'}
                                text={el.name}
                                className={'details-dummy-buttons'}
                                focusClass={'details-dummy-buttons-focused'}
                                onFocus={handleBottomDrawerOpen}
                            />) : (<div key={`btn_dummy_${idx}`} className={'details-dummy-buttons'}> {el.name}
                            </div>)
                        ))}
                    </div>
                </>
                ))}
        </div>
        {isDrawerOpen && (
            <BottomDrawer isOpen={isDrawerOpen} onClose={handleBottomDrawerClose} focusKey={'BTM_DRWR'}>
                {isDrawerContentReady && tabs.length > 0 &&
                    <TabbedComponent
                        tabs={tabs}
                        isDrawerContentReady={isDrawerContentReady}
                        focusKey={'TAB_COMP'}
                    />}
            </BottomDrawer>

        )}
    </FocusContext.Provider>
    );
}

export default Movie_Detail