import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PLAYLIST_TYPE = "Home";

// AUTH 
export const fetchApiKey = async () => {
  try{
    const response = await fetchData(API.AUTH.GET_APIKEY,{requireApiKey: false});
    if(response && response?.isSuccess){
      const res = response?.data;
      let apiKey = res?.apiKey;
      let appIdleTime = res?.appIdleTime;
      let minVersion = res?.minVersions?.result?.data?.min_tizen;
      return {
        apiKey,
        appIdleTime,
        minVersion
      }
    }else{
      toast.error('Api Data Not Found, GET_APIKEY')
    }
  }catch (error){
    console.error("Error fetching app features:", error);
    toast.error("Failed to load app features");
  }
}

export const getUserAccountStatusV2 = async (data, options={}) =>{
  try{
  const response  = await postData(API.AUTH.POST_USERACCOUNT_STATUS,data,options)
  return response || null;
  }
  catch(error){
    toast.error('Error getting user Account Status');
  }
}

export const getUserAppSession = async (data,options={}) => {
  try {
    const response = await postData(API.AUTH.POST_APPSESSION, data, options);
    return response || null
} catch (error) {
    toast.error('Error getting Subscription Status');
}
}

export const LoginTv = async (data,options={}) =>{
  try{
    const response = await postData(API.AUTH.LOGIN,data,options);
    return response;
  } catch(error){
    toast.error('Error Loginng in User');
  }
}

export const LogoutTV = async(data,options ={}) =>{
  try{
    const response = await postData(API.AUTH.POST_LOGOUT_DEVICE,data,options);
    return response;
  } catch(error){
    toast.error('Error Logout TV');
  }
}

export const fetchUserProfile = async (data,options={}) =>{
 try{
  const response = await postData(API.AUTH.GET_USER_PROFILE,data,options);
  return response || {};
 } catch(error){
  toast.error('Error fetching user profile');
 }
}

export const fetchUserSubscriptionStatus = async (options={}) =>{
  try{
    const response = await fetchData(API.AUTH.GET_USER_SUBSCRIPTION_STATUS,options);
    return response || {};
   } catch(error){
    toast.error('Error fetching user profile');
   }
}

// Menu
export const fetchAppFeatures = async () => {
  try {
    const response = await fetchData(API.MENU.GET_APP_FEATURES);
    return response || [];
  } catch (error) {
    console.error("Error fetching app features:", error);
    toast.error("Failed to load app features");
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
    toast.error("Failed to load homepage content");
    return [];
  }
};

export const fetchPlaylistPage = async (userId, page) => {
  try {
    const response = await fetchData(
      API.HOMEPAGE.GET_PLAYLIST_DATA(
        DEFAULT_PLAYLIST_TYPE,
        userId,
        page,
        DEFAULT_PAGE_SIZE
      )
    );
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    toast.error("Failed to load playlist");
    return [];
  }
};

export const fetchContinueWatchingData = async (userId) => {
  try {
    const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId));
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching continue watching data:", error);
    toast.error("Failed to load continue watching section");
    return [];
  }
};
