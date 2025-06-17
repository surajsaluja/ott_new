import { useState, useEffect } from "react"
import { processLiveTvCategoriesToPlaylist, sanitizeAndResizeImage } from "../../../../Utils";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { fetchRadioHomePageData } from "../../../../Service/MediaService";
import { useUserContext } from "../../../../Context/userContext";
import { showModal } from "../../../../Utils";

export const useRadioHomePage = () => {

  const [radioHomePageData, setRadioHomePageData] = useState([]);
  const [radioBannersData, setRadioBannersData] = useState([]);
  const [isRadioDataLoading, setIsRadioDataLoading] = useState(false);
  const { userObjectId, uid, isLoggedIn } = useUserContext();
  const history = useHistory();

  const loadInitialData = async () => {
    setIsRadioDataLoading(true);
    try {
      const radioResponse = await fetchRadioHomePageData();
      setRadioBannersData(radioResponse.data.radioBanner);

      const modifiedItems = radioResponse.data.radioData.map((item, index) => ({
        ...item,
        webThumbnail: sanitizeAndResizeImage(item.imagePath, 250),
        mobileThumbnail: sanitizeAndResizeImage(item.imagePath, 250),
        playListId: 1,
        mediaID: item.id,
        category: 'Radio',
      }))

      let radioPlayList = [{
        playListId: 1,
        playlistName: 'Radio',
        playListType: 'Radio',
        height: 250,
        width: 250,
        playlistItems: modifiedItems,
      }];

      setRadioHomePageData(radioPlayList);
    } catch (e) {
      console.error("Failed to load homepage", e);
    } finally {
      setIsRadioDataLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

    const redirectToLogin = () => {
    history.replace('/login', { from: '/' });
  };

  const onRadioChannelEnterPress = ({ assetData }) => {
    if (isLoggedIn && userObjectId) {
      history.push('/playRadio',
        {
          audioName: assetData.title,
          audioImage: assetData.imagePath,
          audioplayUrl: assetData.payhttpsURL
        });
    }
    else {
      showModal('Login',
        'You are not logged in !!',
        [
          { label: 'Login', action: redirectToLogin, className: 'primary' }
        ]
      );
    }
  }

  return {
    radioHomePageData,
    radioBannersData,
    isRadioDataLoading,
    onRadioChannelEnterPress
  }
}