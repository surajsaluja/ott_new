import { fetchData } from "../../Api/apiService";
import { API } from "../../Api/constants";

export const fetchAppFeatures = async () => {
  const response = await fetchData(API.MENU.GET_APP_FEATURES);
  return response || [];
};