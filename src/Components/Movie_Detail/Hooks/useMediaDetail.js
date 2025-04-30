import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getMediaDetails } from "../../../Utils/MediaDetails";
import { getMediaRelatedItem } from "../../../Service/MediaService";
import { getProcessedPlaylists } from "../../../Utils";
import { toast } from "react-toastify";
import FocusableButton from "../../Common/FocusableButton";
import FullPageAssetContainer from "../../Common/FullPageAssetContainer";

const useMediaDetail = (mediaId) => {

    // References for Focusable 
    const { ref, focusKey: btnControlsFocusKey, focusSelf } = useFocusable('BTNS_CONTROLS');

    //states
    const [isLoading, setIsLoading] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [mediaDetail, setMediaDetail] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [bottomDrawerActiveTab, setBottomDrawerActiveTab] = useState(1);
    const [isDrawerContentReady, setDrawerContentReady] = useState(false);

    // Support Functions
    const history = useHistory();

    const generateTabs = (detail) => {
        const dynamicTabs = [];

        if (detail?.mediaDetail?.category === 'Web Series') {
            dynamicTabs.push({
                name: 'Seasons & Episodes',
                action: null,
                focusKey: 'tabDetail_Season',
                id: 1,
            });
        }

        dynamicTabs.push({
            name: 'More Like This',
            action: null,
            focusKey: 'tabDetail_RelatedItems',
            id: 2,
        });

        if (detail?.groupedStartCasts) {
            dynamicTabs.push({
                name: 'StarCast',
                action: null,
                focusKey: 'tabDetail_startCast',
                id: 3,
            })
        }
        return dynamicTabs
    }

    const returnUserToHomePage = () => {
        history.replace('/');
        return;
    }

    // useEffects
    useEffect(() => {
        if (!mediaId) {
            returnUserToHomePage();
            return;
        }
        fetchMediaDetail(mediaId);
    }, [mediaId]);

    // set Focus to Page when media Loads

    useEffect(() => {
        if (!isLoading) {
            focusSelf();
        }
    }, [isLoading]);

    useEffect(() => {
        if (isDrawerOpen && bottomDrawerActiveTab === 2) {
            getRelatedMediaItems(mediaId);
        }
    }, [isDrawerOpen, bottomDrawerActiveTab]);

    useEffect(() => {
        if (isDrawerOpen) {
            const timer = setTimeout(() => {
                setDrawerContentReady(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setDrawerContentReady(false); // Reset when closing
        }
    }, [isDrawerOpen]);

    // Data Fetching Functions

    const fetchMediaDetail = async (mediaId) => {
        try {
            setIsLoading(true);
            const mediaDetailsResponse = await getMediaDetails(mediaId);
            if (mediaDetailsResponse.isSuccess) {
                setMediaDetail(mediaDetailsResponse.data.mediaDetail);
                setTabs(generateTabs(mediaDetailsResponse.data));
            }
            else {
                toast.error(mediaDetailsResponse.message);
                setMediaDetail(null);
                returnUserToHomePage();
            }
        } catch (err) {
            toast.error(err);
            setMediaDetail(null);
            returnUserToHomePage();
        } finally {
            setIsLoading(false);
        }
    }

    const getRelatedMediaItems = async (mediaId) => {
        try {
            const response = await getMediaRelatedItem(mediaId);
            if (response.isSuccess && response.data?.length) {
                setRelatedItems(getProcessedPlaylists(response.data, 10));
            } else {
                setRelatedItems([]);
            }
        } catch (err) {
            toast.error("Failed to load related items");
            setRelatedItems([]);
        }
    };

    // Bottom Drawer Functions

    const handleBottomDrawerClose = () => {
        setDrawerOpen(false);
        // setFocus('detailBtnWatchMovie');
    }

    const handleBottomDrawerOpen = () => {
        if (!isDrawerOpen) {
            setTimeout(() => {
                setDrawerOpen(true);
                // setFocus(tabs[0].focusKey);
                setBottomDrawerActiveTab(tabs[0].id);
            }, 100);
        }
    };

    // Render Data On Bottom Drawer

    const renderMediaBottomDrawerData = () => {
        return (
                <div className='bottom-content-detail' style={{margin:"20px 30px"}}>
                    {isDrawerContentReady && (
                        <>
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
                                {bottomDrawerActiveTab === 2 && (
                                    <FullPageAssetContainer
                                        assets={relatedItems}
                                        onAssetPress={(asset) => console.log('Related item clicked', asset)}
                                    />
                                )}
                                {bottomDrawerActiveTab === 3 && <p>Cast & Crew</p>}
                            </div>
                        </>
                    )}
                </div>
        );
    };


    return {
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
    }
}

export default useMediaDetail