import { useState, useEffect } from "react"
import { fetchLiveTvHomePageData } from "../../../../Service/LiveTVService";
import { processLiveTvCategoriesToPlaylist } from "../../../../Utils";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export const useLiveTv = () =>{

    const [liveTvHomePageData,setLiveTvHomePageData] =  useState([]);
    const [liveTvBannersData,setLiveTvBannersData] = useState([]);
    const [isTvDataLoading, setIsTvDataLoading] = useState(false);
    const history = useHistory(); 

    const loadInitialData = async () => {
        setIsTvDataLoading(true);
        try {
          const liveTvResponse = await fetchLiveTvHomePageData();
          let processed = processLiveTvCategoriesToPlaylist(liveTvResponse.categories);
          setLiveTvBannersData(liveTvResponse.banners)
    
          setLiveTvHomePageData(processed);
        } catch (e) {
          console.error("Failed to load homepage", e);
        } finally {
          setIsTvDataLoading(false);
        }
      };

        useEffect(() => {
          loadInitialData();
        }, []);

        const onChannelEnterPress = ({assetData}) =>{
          history.push('/livetvschedule',assetData);
        }

    return{
        liveTvHomePageData,
        liveTvBannersData,
        isTvDataLoading,
        onChannelEnterPress
    }
}