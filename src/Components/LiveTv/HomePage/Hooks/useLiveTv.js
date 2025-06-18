import { useState, useEffect } from "react"
import { fetchLiveTvHomePageData } from "../../../../Service/LiveTVService";
import { processLiveTvCategoriesToPlaylist } from "../../../../Utils";
import { useHistory } from "react-router-dom";
import { useUserContext } from "../../../../Context/userContext";
import { showModal } from "../../../../Utils";

export const useLiveTv = () =>{

    const [liveTvHomePageData,setLiveTvHomePageData] =  useState([]);
    const [liveTvBannersData,setLiveTvBannersData] = useState([]);
    const [isTvDataLoading, setIsTvDataLoading] = useState(false);
    const history = useHistory();
    
    const { userObjectId, uid, isLoggedIn } = useUserContext();

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

        const redirectToLogin = () => {
            history.replace('/login', { from: '/' });
          };
        
           const onChannelEnterPress = ({assetData}) => {
            if (isLoggedIn && userObjectId) {
              history.push('/livetvschedule',assetData);
            }
            else {
              showModal('Login',
                'You are not logged in !!',
                [
                  { label: 'Login', action: redirectToLogin, className: 'primary' }
                ]
              );
            }
          };

    return{
        liveTvHomePageData,
        liveTvBannersData,
        isTvDataLoading,
        onChannelEnterPress
    }
}