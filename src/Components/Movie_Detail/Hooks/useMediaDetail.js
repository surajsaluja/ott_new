import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState, useCallback,useMemo } from "react";
import { useHistory } from "react-router-dom";
import { getMediaDetails, getMediaRelatedItemDetails, getWebSeriesEpisodesBySeason } from "../../../Utils/MediaDetails";
import { getMediaRelatedItem } from "../../../Service/MediaService";
import { getProcessedPlaylists } from "../../../Utils";
import FullPageAssetContainer from "../../Common/FullPageAssetContainer";
import { toast } from "react-toastify";
import Seasons_Tab from "../../Season_EpisodeList/Seasons_Tab";

const useMediaDetail = (mediaId, category,focusKey) => {
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
    const [webSeriesId,setWebSeriesId] = useState(null);
    const [webSeriesSeasons, setWebSeriesSeasons]  = useState(null);
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);
    const [episodesCache, setEpisodesCache] = useState({});
    const [relatedItems, setRelatedItems] = useState([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isDrawerContentReady, setDrawerContentReady] = useState(false);
    const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(true); // Add a loading state for related items
    const [isSeasonsLoading, setIsSeasonsLoading] = useState(true);

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
        setWebSeriesSeasons(null);
        setIsSeasonsLoading(true);
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

    useEffect(()=>{
        if(selectedSeasonId == null)
        {
            return;
        }
        loadEpisodes(selectedSeasonId)
    },[selectedSeasonId])

    // Data Fetching Functions

    const fetchMediaDetail = async (mediaId) => {
        try {
            setIsLoading(true);
            const mediaDetailsResponse = await getMediaDetails(mediaId,category);
            if (mediaDetailsResponse.isSuccess) {
                let mediaDet  =  mediaDetailsResponse.data.mediaDetail;
                setMediaDetail(mediaDet);
                if(category == 'web series' && mediaDet.seasons && mediaDet.seasons.length > 0){
                    setWebSeriesId(mediaDet.webSeriesId);
                    setWebSeriesSeasons(mediaDet.seasons);
                    setSelectedSeasonId(mediaDet.seasons[0].id);
                }
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
            const response = await getMediaRelatedItemDetails(mediaId);
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

    // Seasons and Episodes Functions

    const loadEpisodes = useCallback(async (seasonId) => {
        if (episodesCache[seasonId]) return;
    
        try {
            const response = await getWebSeriesEpisodesBySeason(webSeriesId, seasonId);
            if (response?.isSuccess) {
                setEpisodesCache(prev => ({ ...prev, [seasonId]: response.data }));
            }
        } catch (err) {
            console.error('Failed to load episodes', err);
        }
        finally{
            setIsSeasonsLoading(false);
        }
    }, [webSeriesId, episodesCache]);
    
    
      const handleSeasonSelect = (id) => {
        setSelectedSeasonId(id);
        loadEpisodes(id);
      };
    

    // Bottom Drawer Functions

    const handleBottomDrawerClose = () => {
        setDrawerOpen(false);
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

      const RenderSeasonEpisodes  = useCallback(()=>{
        if (!webSeriesSeasons || webSeriesSeasons.length === 0) return <p>No Seasons available</p>;

        return <Seasons_Tab seasons={webSeriesSeasons} selectedSeason={selectedSeasonId} onSeasonSelect={handleSeasonSelect} episodes={episodesCache[selectedSeasonId] || []} focusKey={'SEASON_CNT'}/>
      },[selectedSeasonId, webSeriesSeasons,handleSeasonSelect,setSelectedSeasonId,episodesCache]);

    const tabs = useMemo(() => {
        if (!mediaDetail) return [];
      
        const dynamicTabs = [];
      
        if (category === 'web series' && webSeriesSeasons.length > 0) {
          dynamicTabs.push({
            name: 'Seasons & Episodes',
            action: null,
            id: 1,
            renderContent: RenderSeasonEpisodes,
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
      }, [mediaDetail, webSeriesSeasons, RenderRelatedItems, RenderSeasonEpisodes]);


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