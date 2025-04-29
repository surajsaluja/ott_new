import { useEffect, useState } from "react"
import { useFocusable, setFocus } from "@noriginmedia/norigin-spatial-navigation"
import { getMediaDetails } from "../../../Utils/MediaDetails";
import { getMediaRelatedItem } from "../../../Service/MediaService";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const useMovieDetail = (mediaId) => {
    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable('MOVIE_DETAIL_PAGE');
    const [mediaDetail, setMediaDetail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const history = useHistory();
    const [bottomDrawerActiveTab,setBottomDrawerActiveTab] = useState(1);
    const [tabs, setTabs] = useState([]);

    const generateTabs = (detail) =>{
        const dynamicTabs = [];

        if(detail?.mediaDetail?.category === 'Web Series'){
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
              
        if(detail?.groupedStartCasts){
            dynamicTabs.push({
                name: 'StarCast',
                action: null,
                focusKey: 'tabDetail_startCast',
                id: 3,
              })
        }

              return dynamicTabs

    }

    useEffect(() => {
        if (!mediaId) {
            returnUserToHomePage();
            return;
        }
        fetchMediaDetail(mediaId);
    }, [mediaId]); // Only runs when mediaId changes

    useEffect(() => {
        if (!isLoading) {
            focusSelf(); // Focus only after data is loaded
        }
    }, [isLoading]);


    const returnUserToHomePage = () => {
        history.replace('/');
        return;
    }

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

    const onMovieWatchPress = () => {

    }

    const onTrailerWatchPress = () => {

    }

    const handleBottomDrawerClose = () => {
        setDrawerOpen(false);
        setFocus('detailBtnWatchMovie');
    }

    const handleBottomDrawerOpen = () => {
        if (!isDrawerOpen) {
            setTimeout(() => {
                setDrawerOpen(true);
                setFocus(tabs[0].focusKey);
                setBottomDrawerActiveTab(tabs[0].id);
            }, 100);
        }
    };

    const getRelatedMediaItems = async (mediaId) => {
        // Not Passing Page Number as Pagination is not applied Server Side fetch 10 records: Navveen Sir UNISYS
        const relatedMediaItems = await getMediaRelatedItem(mediaId);

    }

    return {
        ref,
        currentFocusKey,
        mediaDetail,
        isLoading,
        isDrawerOpen,
        onMovieWatchPress,
        onTrailerWatchPress,
        handleBottomDrawerClose,
        handleBottomDrawerOpen,
        tabs,
        bottomDrawerActiveTab,
        setBottomDrawerActiveTab
    }
}

export default useMovieDetail;