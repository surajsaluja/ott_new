import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";

const ThrowError = (functionName, error) => {
    toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error At ${functionName}:`, error);
    return null;
};

export const fetchLiveTvHomePageData = async () => {
    try {
        const response = await fetchData(API.LIVETV.GET_TV_HOME_PAGE_DATA);
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchLiveTvHomePageData", error);
    }
}

export const fetchAllLiveTvSchedule = async (data, options) => {
    try {
        if (!data) throw new Error("Post Data Required");
        const response = await postData(API.LIVETV.GET_ALL_CHANNEL_SCHEDULE, data, options);
        return response;
    } catch (error) {
        return ThrowError("fetchLiveTvSchedule", error);
    }
}

export const fetchLiveTvScheduleWithDetail = async (channelHandle) =>{
    try{
        if(!channelHandle) throw new Error("Channel Handle Required");
        const response = await fetchData(API.LIVETV.GET_CHANNEL_SCHEDULE(channelHandle));
        return response;
    }catch(error){
        return ThrowError('fetchLiveTvScheduleWithDetail',error);
    }
}