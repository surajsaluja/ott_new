import { fetchData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";
import { useUserContext } from "../Context/userContext";

const useMediaService = () => {
  const DEFAULT_PLAYLIST_TYPE = "Home";
  const DEFAULT_PAGE_SIZE = 10;
  const {userObjectId : userObjId,uid} = useUserContext();

  const ThrowError = (functionName, error) => {
    toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error At ${functionName}:`, error);
    return null;
  };

  const fetchHomePageData = async (userId = null) => {
    try {
      const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId ?? uid));
      return response?.data || [];
    } catch (error) {
      return ThrowError("fetchHomePageData", error);
    }
  };

  const fetchPlaylistPage = async (page,userId = null) => {
    try {
      const response = await fetchData(
        API.HOMEPAGE.GET_PLAYLIST_DATA(DEFAULT_PLAYLIST_TYPE, userId ?? uid, page, DEFAULT_PAGE_SIZE)
      );
      return response?.data || [];
    } catch (error) {
      return ThrowError("fetchPlaylistPage", error);
    }
  };

  const fetchContinueWatchingData = async (userId = null) => {
    try {
      const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId ?? uid));
      return response?.data || [];
    } catch (error) {
      return ThrowError("fetchContinueWatchingData", error);
    }
  };

  const loadMediaDetailById = async (mediaId, isWebSeries, userObjectId, options = {}) => {
    try {
      const token = getSanitizedToken();
      let url = null;
      if (!token) throw new Error("User Token Not Found");

      const headers = {
        Authorization: token,
      };

      if (isWebSeries) {
        url = API.MEDIA.GET_WEBSERIES_DETAILS;
      }
      else {
        url = API.MEDIA.GET_MOVIE_DETAILS;
      }

      const response = await fetchData(url(mediaId, userObjectId ?? userObjId), {
        ...options,
        headers
      });

      return response;
    } catch (error) {
      return ThrowError('loadMediaDetailById', error);
    }
  }


  const getTokanizedMediaUrl = async (mediaId, userObjectId = null, options = {}) => {
    try {
      const token = getSanitizedToken();
      if (!token) throw new Error("User Token Not Found");

      const headers = {
        Authorization: token,
      };

      const response = await fetchData(API.MEDIA.GET_TOKENIZED_MEDIA_URL(mediaId, userObjectId ?? userObjId), {
        ...options,
        headers
      });

      return response;
    } catch (error) {
      return ThrowError('loadMediaDetailById', error);
    }
  }
  return {
    fetchHomePageData,
    fetchPlaylistPage,
    fetchContinueWatchingData,
    loadMediaDetailById,
    getTokanizedMediaUrl
  }
}

export default useMediaService;