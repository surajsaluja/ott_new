import { useState, useEffect } from "react"
import { processLiveTvCategoriesToPlaylist } from "../../../../Utils";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { fetchRadioHomePageData } from "../../../../Service/MediaService";

export const useRadioHomePage = () =>{

    const [radioHomePageData,setRadioHomePageData] =  useState([]);
    const [radioBannersData,setRadioBannersData] = useState([]);
    const [isRadioDataLoading, setIsRadioDataLoading] = useState(false);
    const history = useHistory(); 

    const loadInitialData = async () => {
        setIsRadioDataLoading(true);
        try {
          const radioResponse = await fetchRadioHomePageData();
          let processed = processLiveTvCategoriesToPlaylist(radioResponse.data.radioData);
          setRadioBannersData(radioResponse.radioBanner);
    
          setRadioHomePageData(processed);
        } catch (e) {
          console.error("Failed to load homepage", e);
        } finally {
          setIsRadioDataLoading(false);
        }
      };

        useEffect(() => {
          loadInitialData();
        }, []);

        const onRadioChannelEnterPress = ({assetData}) =>{
          history.push('/livetvschedule',assetData);
        }

    return{
        radioHomePageData,
        radioBannersData,
        isRadioDataLoading,
        onRadioChannelEnterPress
    }
}