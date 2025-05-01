import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import { formatTime } from "../../Utils";
import useMediaDetail from "./Hooks/useMediaDetail";
import BottomDrawer from "../Common/BottomDrawer";
import './index.css'
import BottomTabbedComponent from "./BottomTabbedComponent";

function Movie_Detail(focusKey) {
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
    } = useMediaDetail(207, focusKey);


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
                                {mediaDetail?.ageRangeId && <span><i><GiVibratingShield /></i>{mediaDetail?.ageRangeId}</span>}
                                {mediaDetail?.cultures && <span>{mediaDetail?.cultures}</span>}
                            </div>
                            {mediaDetail.description && <p className="description-detail">{mediaDetail.description}</p>}
                            {mediaDetail &&
                                <div className="buttons-detail" ref={ref}>
                                    <FocusableButton
                                    key={'detail_watch'}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Watch Movie"}
                                    />
                                    <FocusableButton
                                    key={'detail_trailer'}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Watch Trailer"}
                                    />
                                    <FocusableButton
                                    key={'detail_continue_watch'}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Continue Watching"}
                                    />
                                    <FocusableButton
                                    key={'detail-wishlist'}
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Add To Favourutes"}
                                    />
                                </div>

                            }
                        </div>
                    </div>
                    <div className="buttons-bottom-dummy">
                        {tabs.map((el, idx) => (
                            idx == 0 ? (<FocusableButton
                                key={'Bottom 1'}
                                text={el.name}
                                className={'btn-bottomDrawer-detail-tab'}
                                focusClass={'btn-bottomDrawer-detail-tab-focused'}
                                onFocus={handleBottomDrawerOpen}
                            />) : (<div key={`btn_dummy_${idx}`}className={'btn-bottomDrawer-detail-tab'}> {el.name}
                            </div>)
                        ))}
                    </div>
                </>
            )}
        </div>
        {isDrawerOpen && (
            <BottomDrawer isOpen={isDrawerOpen} onClose={handleBottomDrawerClose} focusKey={'BTM_DRWR'}>
               {isDrawerContentReady && tabs.length > 0 && <BottomTabbedComponent
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