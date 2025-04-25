import { fetchData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";

const DEFAULT_PLAYLIST_TYPE = "Home";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_LANGUAGE = 1;
const DEFAULT_PAGE = 1;
const RELATED_MEDIA_DEFAULT_PAGE_SIZE = 50;
const userObjId = localStorage.getItem('userObjectId') ?? null;
const uid = localStorage.getItem('uid') ?? null;

const ThrowError = (functionName, error) => {
    toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error At ${functionName}:`, error);
    return null;
};

export const fetchHomePageData = async (userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId ?? uid));
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchHomePageData", error);
    }
};

export const fetchPlaylistPage = async (page, userId = null) => {
    try {
        const response = await fetchData(
            API.HOMEPAGE.GET_PLAYLIST_DATA(DEFAULT_PLAYLIST_TYPE, userId ?? uid, page, DEFAULT_PAGE_SIZE)
        );
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchPlaylistPage", error);
    }
};

export const fetchContinueWatchingData = async (userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId ?? uid));
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchContinueWatchingData", error);
    }
};

export const loadMediaDetailById = async (mediaId, isWebSeries, userObjectId, options = {}) => {
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

export const getMediaRelatedItem = async (mediaId, userObjId,page,pageSize,language,options = {}) => {
    try{
        const response  = await fetchData(API.MEDIA.GET_MEDIA_RELATED_ITEMS(mediaId,language ?? DEFAULT_LANGUAGE,userObjId ?? userObjId,page ?? DEFAULT_PAGE,pageSize ?? RELATED_MEDIA_DEFAULT_PAGE_SIZE),options);
        return response;
    }catch(error){
        return ThrowError('getRelatedMedia',error);

    }
}

export const getTokanizedMediaUrl = async (mediaId, userObjectId = null, options = {}) => {
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
        return ThrowError('getTokenisedMediaUrl', error);
    }
}
