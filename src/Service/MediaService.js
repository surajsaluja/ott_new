import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";

const DEFAULT_PLAYLIST_TYPE = "Home";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_LANGUAGE = 1;
const DEFAULT_PAGE = 1;
const RELATED_MEDIA_DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SECTION = 5;
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

export const fetchBannersBySection = async(section, language = null, userId = null) => {
    try{
        const response = await fetchData(API.HOMEPAGE.GET_BANNER_DATA(section ?? DEFAULT_SECTION,language ?? DEFAULT_LANGUAGE,userId ?? uid));
        return response || null;
    }catch(error){
        return ThrowError('fetchBannersBySection',error);
    }
}

export const fetchPlaylistPage = async (section,page, userId = null) => {
    try {
        const response = await fetchData(
            API.HOMEPAGE.GET_PLAYLIST_DATA(section ?? DEFAULT_PLAYLIST_TYPE, userId ?? uid, page, DEFAULT_PAGE_SIZE)
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

export const fetchMediaDetailById = async (mediaId, isWebSeries, userObjectId, options = {}) => {
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

export const fetchMediaRelatedItem = async (mediaId, userObjId,page,pageSize,language,options = {}) => {
    try{
        const response  = await fetchData(API.MEDIA.GET_MEDIA_RELATED_ITEMS(mediaId,language ?? DEFAULT_LANGUAGE,userObjId ?? userObjId,page ?? DEFAULT_PAGE,pageSize ?? RELATED_MEDIA_DEFAULT_PAGE_SIZE),options);
        return response;
    }catch(error){
        return ThrowError('getRelatedMedia',error);

    }
}

export const fetchTokanizedMediaUrl = async (mediaId, userObjectId = null, options = {}) => {
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

export const fetchWebSeriesEpisodeBySeasonId = async (webSeriesId,seasonId,language,userObjectId,page,pageSize) =>{
    try{
        if(!webSeriesId || webSeriesId == null){
            throw Error('Webseries ID is an compulsary field');
        }
        if(!seasonId || seasonId == null){
            throw Error('Season Id is an compulsary field');
        }
        const response = await fetchData(API.MEDIA.GET_WEBSERIES_EPISODES(webSeriesId,seasonId,language ?? DEFAULT_LANGUAGE,userObjectId ?? userObjectId,page??DEFAULT_PAGE,pageSize ?? DEFAULT_PAGE_SIZE));
        return response;

    }catch(error){
        return ThrowError('fetchWebSeriesEpisodeBySeasonId',error);
    }
}

export const updateMediaItemToWishlist = async (data,options={}) =>{
    try {
          const token = getSanitizedToken();
          if(!data) throw new Error("Post Data Required");
          if (!token) throw new Error("User Token Not Found");
    
          const headers = {
            Authorization: token,
          };
          
          const response = await postData(API.MEDIA.POST_FAVOURITE_MEDIA_ITEM, data,{
            ...options,
            headers,
          });
          return response;
        } catch (error) {
          return ThrowError("fetchUserSubscriptionStatus", error);
        }
}
