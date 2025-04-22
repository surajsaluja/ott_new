import { fetchData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";

const DEFAULT_PLAYLIST_TYPE = "Home";
const DEFAULT_PAGE_SIZE = 10;

const ThrowError = (functionName, error) => {
  toast.error(`Error in ${functionName}: ${error.message || error}`);
  console.error(`Api Error At ${functionName}:`, error);
  return null;
};

export const fetchHomePageData = async (userId) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId));
    return response?.data || [];
  } catch (error) {
    return ThrowError("fetchHomePageData", error);
  }
};

export const fetchPlaylistPage = async (userId, page) => {
  try {
    const response = await fetchData(
      API.HOMEPAGE.GET_PLAYLIST_DATA(DEFAULT_PLAYLIST_TYPE, userId, page, DEFAULT_PAGE_SIZE)
    );
    return response?.data || [];
  } catch (error) {
    return ThrowError("fetchPlaylistPage", error);
  }
};

export const fetchContinueWatchingData = async (userId) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId));
    return response?.data || [];
  } catch (error) {
    return ThrowError("fetchContinueWatchingData", error);
  }
};

export const loadMediaDetailById = async (mediaId, userObjectId, isWebSeries,options={}) => {
  try {
    const token = getSanitizedToken();
    let url = null;
    if (!token) throw new Error("User Token Not Found");

    const headers = {
      Authorization: token,
    };
    
    if(isWebSeries)
    {
      url = API.WEBSERIES.GET_WEBSERIES_DETAILS;
    }
    else{
      url = API.MOVIEDETAIL.GET_MOVIE_DETAILS;
    }

    const response  = await fetchData(url(mediaId, userObjectId), {
      ...options,
      headers
    });

    return response;
  } catch (error) {
    return ThrowError('loadMediaDetailById', error);
  }
}
