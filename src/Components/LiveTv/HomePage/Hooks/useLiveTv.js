import { useState, useEffect } from "react"
import { fetchLiveTvHomePageData } from "../../../../Service/LiveTVService";
import { processLiveTvCategoriesToPlaylist } from "../../../../Utils";

export const useLiveTv = () =>{

    const [liveTvHomePageData,setLiveTvHomePageData] =  useState([]);
    const [liveTvBannersData,setLiveTvBannersData] = useState([]);
    const [isTvDataLoading, setIsTvDataLoading] = useState(false); 

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

    return{
        liveTvHomePageData,
        liveTvBannersData,
        isTvDataLoading
    }
}