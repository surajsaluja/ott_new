// services/homePageService.js
import { fetchData } from "../../Api/apiService";
import { API } from "../../Api/constants";

export const fetchHomePageData = async (userId) => {
  const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId));
  return response?.data || [];
};

export const fetchPlaylistPage = async (userId, page) => {
  const response = await fetchData(API.HOMEPAGE.GET_PLAYLIST_DATA("Home", userId, page, 10));
  return response?.data || [];
};

export const fetchContinueWatchingData =  async (userId) => {
  const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId));
  return response?.data || [];
}
