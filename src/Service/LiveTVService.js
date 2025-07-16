import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";

const ThrowError = (functionName, error) => {
    // toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error in ${functionName}: ${error.message || error}`);
    throw new Error(error.message || error);
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

export const fetchLiveTvScheduleWithDetail = async (channelHandle, options = {}) => {
    try {
        if (!channelHandle) throw new Error("Channel Handle Required");
        const response = await fetchData(API.LIVETV.GET_CHANNEL_SCHEDULE(channelHandle));
        return response;
    } catch (error) {
        return ThrowError('fetchLiveTvScheduleWithDetail', error);
    }
}

export const getTokanizedLiveTVUrl = async (channelHandle, options = {}) => {
    try {
        const token = getSanitizedToken();
        const userObjId = localStorage.getItem('userObjectId');
        const uid = localStorage.getItem('uid');

        if (!channelHandle) throw new Error("Channel Handle Required");
        if (!token) throw new Error("User Token Not Found");

        const headers = {
            Authorization: token,
        };

        const response = await fetchData(
            API.LIVETV.GET_TOKENIZED_MEDIA_TV_URL(channelHandle, userObjId),
            {
                ...options,
                headers,
            }
        );
        return response;

    } catch (error) {
        return ThrowError('getTokanizedLiveTVUrl', error);
    }
};

export const saveLiveTvChannelProgress = async (startTime, endTime, channelId, options = {}) => {

    try {
        const userObjId = localStorage.getItem('userObjectId');
        const appSessionId = localStorage.getItem('appSessionId');

        if (!userObjId) throw new Error('User Object Id not found');
        if (!appSessionId) throw new Error('app session id not found');
        if (!channelId) throw new Error('Channel Id not provided');

        const data = {
            "TokenId": userObjId,
            "ChannelId": channelId,
            "StartTime": startTime,
            "EndTime": endTime,
            "AppSessionId": appSessionId
        };

        const response = await postData(API.LIVETV.SAVE_CHANNEL_PROGRESS, data, options);
        if (response && response.status) {
            return {
                isSuccess: true,
                message: response.message
            } 
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        return ThrowError('saveLiveTvChannelProgress', error.message || error);
    }

}
