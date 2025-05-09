import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { useParams } from 'react-router-dom';
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate, MdAdd } from 'react-icons/md';
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

function Movie_Detail(focusKey) {
    const {categoryId, mediaId} = useParams();
    const {
        ref,
        btnControlsFocusKey,
        isLoading,
        mediaDetail,
        isDrawerOpen,
        tabs,
        isDrawerContentReady,
        handleBottomDrawerOpen,
        handleBottomDrawerClose,
        isMediaFavourite,
        showResumeBtn,
        updateMediaWishlistStatus
    } = useMediaDetail(mediaId, categoryId, focusKey);


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
                                {mediaDetail?.ageRangeId && <span><i><GiVibratingShield /></i>{`${mediaDetail?.ageRangeId}+`}</span>}
                                {mediaDetail?.cultures && <span>{mediaDetail?.cultures}</span>}
                            </div>
                            <p className="description-detail">{mediaDetail.description}</p>
                            {mediaDetail &&
                                <div className="buttons-detail" ref={ref}>
                                    <FocusableButton
                                        key={'detail_watch'}
                                        icon={<FaPlay />}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={showResumeBtn ? `Resume Movie` : `Watch Movie`}
                                    />
                                    {showResumeBtn && <FocusableButtonIconTooltip
                                        icon={<MdOutlineRestartAlt />}
                                        text={'Start Over'}
                                    />}
                                    <FocusableButtonIconTooltip
                                        icon={<MdMovie />}
                                        text={'Watch Trailer'}
                                    />
                                    <FocusableButtonIconTooltip
                                        icon={isMediaFavourite ? <IoHeartSharp /> : <MdAdd />}
                                        text={isMediaFavourite ? 'Remove From Wishlist' : 'Add To Wishlist'}
                                        onEnterPress={updateMediaWishlistStatus}
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
            )}
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