import { fetchData } from "../Api/apiService";
import { API } from "../Api/constants";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PLAYLIST_TYPE = "Home";

// Menu
export const fetchAppFeatures = async () => {
  try {
    const response = await fetchData(API.MENU.GET_APP_FEATURES);
    return response || [];
  } catch (error) {
    console.error("Error fetching app features:", error);
    return [];
  }
};

// Home Page
export const fetchHomePageData = async (userId) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId));
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return [];
  }
};

export const fetchPlaylistPage = async (userId, page) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_PLAYLIST_DATA(DEFAULT_PLAYLIST_TYPE, userId, page, DEFAULT_PAGE_SIZE));
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return [];
  }
};

export const fetchContinueWatchingData = async (userId) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId));
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching continue watching data:", error);
    return [];
  }
};
