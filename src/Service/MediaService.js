import { fetchData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";

const DEFAULT_PLAYLIST_TYPE = "Home";
const DEFAULT_PAGE_SIZE = 10;

const ThrowError = (functionName, error) => {
    toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error At ${functionName}:`, error);
    return null;
  };

  export const fetchHomePageData = async (userId)  =>{
    try {
      const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId));
      return response?.data || [];
    } catch (error) {
      return ThrowError("fetchHomePageData", error);
    }
  };

  export const fetchPlaylistPage =async (userId, page) => {
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

  export const fetchAppFeatures = async () => {
    try {
      return await fetchData(API.MENU.GET_APP_FEATURES) || [];
    } catch (error) {
      return ThrowError("fetchAppFeatures", error);
    }
  };

