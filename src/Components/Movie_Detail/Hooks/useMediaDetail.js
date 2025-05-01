import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState, useCallback,useMemo } from "react";
import { useHistory } from "react-router-dom";
import { getMediaDetails } from "../../../Utils/MediaDetails";
import { getMediaRelatedItem } from "../../../Service/MediaService";
import { getProcessedPlaylists } from "../../../Utils";
import FullPageAssetContainer from "../../Common/FullPageAssetContainer";
import { toast } from "react-toastify";

const useMediaDetail = (mediaId, focusKey) => {
    // References for Focusable
    const { ref, focusKey: btnControlsFocusKey, hasFocusedChild, focusSelf } = useFocusable({
        focusable: true,
        trackChildren: true,
        focusKey,
        saveLastFocusedChild: true
    });

    //states
    const [isLoading, setIsLoading] = useState(false);
    const [mediaDetail, setMediaDetail] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isDrawerContentReady, setDrawerContentReady] = useState(false);
    const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(true); // Add a loading state for related items

    // Support Functions
    const history = useHistory();

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
        setRelatedItems(null); // Reset related items when mediaId changes
        setIsRelatedItemsLoading(true); // Reset loading state
    }, [mediaId]);

    // set Focus to Page when media Loads
    useEffect(() => {
        if (!isLoading) {
            focusSelf();
        }
    }, [isLoading]);

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
                getRelatedMediaItems(mediaId);
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
        } finally {
            setIsRelatedItemsLoading(false); // Set loading to false after fetching (success or failure)
        }
    };

    // Bottom Drawer Functions

    const handleBottomDrawerClose = () => {
        setDrawerOpen(false);
        // setFocus('detailBtnWatchMovie');
    }

    const handleBottomDrawerOpen = () => {
        if (!isDrawerOpen) {
            setTimeout(()=>{
            setDrawerOpen(true);
        },100)
        }
    };

    // Render Data On Bottom Drawer

    const RenderRelatedItems = useCallback(() => {
        if (isRelatedItemsLoading) return <p>Loading related items...</p>;
        if (!relatedItems.length) return <p>No related items available.</p>;
    
        return <FullPageAssetContainer assets={relatedItems} focusKey={'AST_CNT_DET_REL'}/>;
      }, [isRelatedItemsLoading, relatedItems]);

    const tabs = useMemo(() => {
        if (!mediaDetail) return [];
      
        const dynamicTabs = [];
      
        if (mediaDetail.category === 'Web Series') {
          dynamicTabs.push({
            name: 'Seasons & Episodes',
            action: null,
            id: 1,
            renderContent: () => (
              <FullPageAssetContainer
                assets={[]}
                onAssetPress={(asset) => console.log('Episode clicked', asset)}
                focusKey={'AST_CNT_DET'}
              />
            ),
          });
        }
      
        dynamicTabs.push({
          name: 'More Like This',
          action: null,
          focusKey: 'tabDetail_RelatedItems',
          id: 2,
          renderContent: RenderRelatedItems,
        });
      
         if (mediaDetail.groupedStartCasts) {
          dynamicTabs.push({
            name: 'StarCast',
            action: null,
            focusKey: 'tabDetail_startCast',
            id: 3,
            renderContent: () => <p>Cast & Crew</p>,
          });
        }
      
        return dynamicTabs;
      }, [mediaDetail, RenderRelatedItems]);


    return {
        ref,
        btnControlsFocusKey,
        isLoading,
        mediaDetail,
        isDrawerOpen,
        tabs,
        isDrawerContentReady,
        handleBottomDrawerOpen,
        handleBottomDrawerClose,
    }
}

export default useMediaDetail