import { useEffect, useState } from "react"
import { useFocusable,setFocus } from "@noriginmedia/norigin-spatial-navigation"
import { getMediaDetails } from "../../../Utils/MediaDetails";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
const useMovieDetail = (mediaId) => {
    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable('MOVIE_DETAIL_PAGE');
    const [mediaDetail, setMediaDetail] = useState('');
    const [isLoading,setIsLoading] = useState(true);
    const [isDrawerOpen,setDrawerOpen] = useState(false);
    const history = useHistory();

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

    const fetchMediaDetail  = async (mediaId) =>{
        try{
        setIsLoading(true);
        const mediaDetailsResponse  =  await getMediaDetails(mediaId);
        if(mediaDetailsResponse.isSuccess){
            setMediaDetail(mediaDetailsResponse.data.mediaDetail);
        }
        else{
            toast.error(mediaDetailsResponse.message);
            setMediaDetail(null);
            returnUserToHomePage();
        }
    }catch(err){
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

    const handleBottomDrawerClose = () =>{
        setDrawerOpen(false);
        setFocus('detailBtnWatchMovie');
    }

    const handleBottomDrawerOpen = () => {
        if (!isDrawerOpen) { 
          setTimeout(() => {
            setDrawerOpen(true);
            setFocus('tabBottomDrawer')
          }, 100);
        }
      };

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
    }
}

export default useMovieDetail;