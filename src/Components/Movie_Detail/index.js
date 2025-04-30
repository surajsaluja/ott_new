import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect } from "react";
import FullPageAssetContainer from "../Common/FullPageAssetContainer";
import FocusableButton from "../Common/FocusableButton";
import { MdOutlineTimer, MdOutlineDateRange, MdStarRate } from 'react-icons/md';
import { GiVibratingShield } from "react-icons/gi";
import { formatTime } from "../../Utils";
import useMediaDetail from "./Hooks/useMediaDetail";
import BottomDrawer from "../Common/BottomDrawer";
import './index.css'

function Movie_Detail() {
    const {
        ref,
        btnControlsFocusKey,
        isLoading,
        mediaDetail,
        isDrawerOpen,
        tabs,
        relatedItems,
        bottomDrawerActiveTab,
        isDrawerContentReady,
        setBottomDrawerActiveTab,
        handleBottomDrawerOpen,
        handleBottomDrawerClose,
    } = useMediaDetail(207);


    return (<>
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
                            {mediaDetail && <FocusContext.Provider value={btnControlsFocusKey}>
                                <div className="buttons-detail" ref={ref}>
                                    <FocusableButton
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Watch Movie"}
                                    />
                                    <FocusableButton
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Watch Trailer"}
                                    />
                                    <FocusableButton
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Continue Watching"}
                                    />
                                    <FocusableButton
                                        className="detail-play-button"
                                        focusClass="detail-play-button-focus"
                                        text={"Add To Favourutes"}
                                    />
                                </div>
                                <div className="btn-dummy-bottom">
                                    <FocusableButton
                                        key={'Bottom 1'}
                                        text={'More Like This'}
                                        className={'btn-bottomDrawer-detail-tab'}
                                        focusClass={'btn-bottomDrawer-detail-tab-focused'}
                                        onFocus={handleBottomDrawerOpen}
                                    />
                                </div>
                            </FocusContext.Provider>}
                        </div>
                    </div>
                </>
            )}
        </div>
        {isDrawerOpen && (
            <BottomDrawer isOpen={isDrawerOpen} onClose={handleBottomDrawerClose}>
                <RenderMediaBottomDrawerData
                    isDrawerContentReady={isDrawerContentReady}
                    tabs={tabs}
                    bottomDrawerActiveTab={bottomDrawerActiveTab}
                    setBottomDrawerActiveTab={setBottomDrawerActiveTab}
                    relatedItems={relatedItems}
                />
            </BottomDrawer>

        )}
    </>
    );
}

const RenderMediaBottomDrawerData = ({
    isDrawerContentReady,
    tabs,
    bottomDrawerActiveTab,
    setBottomDrawerActiveTab,
    relatedItems
}) => {
    const {
        ref: tabsRef,
        focusKey: tabsFocusKey,
        focusSelf: focusTabs
    } = useFocusable({ focusKey: 'TABS_CONTAINER' });

    useEffect(() => {
        if (isDrawerContentReady) {
            focusTabs(); // focus tabs when drawer is ready
        }
    }, [isDrawerContentReady]);

    if (!isDrawerContentReady) return null;

    return (
        <div className="bottom-content-detail" style={{ margin: '20px 30px' }}>
            <FocusContext.Provider value={tabsFocusKey}>
                <div className="bottomDrawer-detail-tabs" ref={tabsRef}>
                    {tabs.map((el) => (
                        <FocusableButton
                            key={el.focusKey}
                            focusKey={el.focusKey} // ✅ correct prop name
                            text={el.name}
                            className="btn-bottomDrawer-detail-tab"
                            focusClass="btn-bottomDrawer-detail-tab-focused"
                            onEnterPress={() => setBottomDrawerActiveTab(el.id)}
                        />
                    ))}
                </div>

                <div className="bottomDrawer-detail-assets-container">
                    {bottomDrawerActiveTab === 1 && <FullPageAssetContainer category="similar" />}
                    {bottomDrawerActiveTab === 2 && (
                        <FullPageAssetContainer
                            assets={relatedItems}
                            onAssetPress={(asset) => console.log('Related item clicked', asset)}
                        />
                    )}
                    {bottomDrawerActiveTab === 3 && <p>Cast & Crew</p>}
                </div>
            </FocusContext.Provider>
        </div>
    );
};

export default Movie_Detail