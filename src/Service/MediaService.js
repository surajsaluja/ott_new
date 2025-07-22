import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getSanitizedToken } from "../Utils";

// Default values
const DEFAULT_PLAYLIST_TYPE = "Home";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_LANGUAGE = 1;
const DEFAULT_PAGE = 1;
const RELATED_MEDIA_DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SECTION = 5;
const DEFAULT_CULTURE = 0;
const DEFAULT_GENRE = 0;

// LocalStorage accessors
const getUid = () => localStorage.getItem("uid") ?? null;
const getUserObjectId = () => localStorage.getItem("userObjectId") ?? null;

// Error handler
const ThrowError = (functionName, error) => {
    console.error(`Error in ${functionName}: ${error.message || error}`);
    throw new Error(error.message || error);
};

// API functions

export const fetchHomePageData = async (userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId ?? getUid()));
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchHomePageData", error);
    }
};

export const fetchBannersBySection = async (section, language = null, userId = null) => {
    try {
        const response = await fetchData(
            API.HOMEPAGE.GET_BANNER_DATA(section ?? DEFAULT_SECTION, language ?? DEFAULT_LANGUAGE, userId ?? getUid())
        );
        return response || null;
    } catch (error) {
        return ThrowError("fetchBannersBySection", error);
    }
};

export const fetchPlaylistPage = async (section, page, userId = null, pageSize = null) => {
    try {
        const response = await fetchData(
            API.HOMEPAGE.GET_PLAYLIST_DATA(section ?? DEFAULT_PLAYLIST_TYPE, userId ?? getUid(), page, pageSize ?? DEFAULT_PAGE_SIZE)
        );
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchPlaylistPage", error);
    }
};

export const fetchContinueWatchingData = async (userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_CONTINUE_WATCH(userId ?? getUid()));
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchContinueWatchingData", error);
    }
};

export const fetchMediaDetailById = async (mediaId, isWebSeries,openWebSeries = false , webSeriesId = 0,userObjectId = null, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!token) throw new Error("User Token Not Found");

        const headers = { Authorization: token };
        // const url = isWebSeries ? API.MEDIA.GET_WEBSERIES_DETAILS : API.MEDIA.GET_MOVIE_DETAILS;

        if(isWebSeries){
            const WebSeriesResponse = await fetchData(API.MEDIA.GET_RECENT_WEBSEREIES_DETAILS(mediaId,userObjectId ?? getUserObjectId(),openWebSeries, webSeriesId ),{
                ...options,
                headers
            })
            return WebSeriesResponse;
        } else{
            const mediaDetailResponse = await fetchData(API.MEDIA.GET_MOVIE_DETAILS(mediaId, userObjectId ?? getUserObjectId()),{
                ...options,
                ...headers
            });
            return mediaDetailResponse
        }

    } catch (error) {
        return ThrowError("loadMediaDetailById", error);
    }
};

export const fetchMediaRelatedItem = async (
    mediaId = null,
    userId = null,
    page = DEFAULT_PAGE,
    pageSize = RELATED_MEDIA_DEFAULT_PAGE_SIZE,
    language = DEFAULT_LANGUAGE,
    options = {}
) => {
    try {
        if (!mediaId) throw new Error("MediaId is required field");

        const response = await fetchData(
            API.MEDIA.GET_MEDIA_RELATED_ITEMS(mediaId, language, userId ?? getUid(), page, pageSize),
            options
        );
        return response;
    } catch (error) {
        return ThrowError("getRelatedMedia", error);
    }
};

export const fetchTokanizedMediaUrl = async (mediaId, userObjectId = null, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!token) throw new Error("User Token Not Found");

        const headers = { Authorization: token };

        const response = await fetchData(
            API.MEDIA.GET_TOKENIZED_MEDIA_URL(mediaId, userObjectId ?? getUserObjectId()),
            {
                ...options,
                headers,
            }
        );

        return response;
    } catch (error) {
        return ThrowError("getTokenisedMediaUrl", error);
    }
};

export const fetchWebSeriesEpisodeBySeasonId = async (
    webSeriesId,
    seasonId,
    language = null,
    userObjectId = null,
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE
) => {
    try {
        if (!webSeriesId) throw new Error("Webseries ID is a compulsory field");
        if (!seasonId) throw new Error("Season Id is a compulsory field");

        const response = await fetchData(
            API.MEDIA.GET_WEBSERIES_EPISODES(
                webSeriesId,
                seasonId,
                language ?? DEFAULT_LANGUAGE,
                userObjectId ?? getUserObjectId(),
                page,
                pageSize
            )
        );

        return response;
    } catch (error) {
        return ThrowError("fetchWebSeriesEpisodeBySeasonId", error);
    }
};

export const fetchWebSeriesAllSeasonsWithEpisodes = async (webSeriesId, userObjectId = null) => {
    try {
        if (!webSeriesId) throw new Error("Webseries ID is a compulsory field");

        const response = await fetchData(
            API.MEDIA.GET_WEBSERIES_DETAILS_WITH_EPISODES(webSeriesId, userObjectId ?? getUserObjectId())
        );
        return response;
    } catch (error) {
        return ThrowError("fetchWebSeriesAllSeasonsWithEpisodes", error);
    }
};

export const updateMediaItemToWishlist = async (data, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!data) throw new Error("Post Data Required");
        if (!token) throw new Error("User Token Not Found");

        const headers = { Authorization: token };

        const response = await postData(API.MEDIA.POST_FAVOURITE_MEDIA_ITEM, data, {
            ...options,
            headers,
        });
        return response;
    } catch (error) {
        return ThrowError("fetchUserSubscriptionStatus", error);
    }
};

export const sendVideoAnalytics = async (data, options) => {
    try {
        if (!data) throw new Error("Post Data Required");

        const response = await postData(API.MEDIA.POST_PLAY_HISTORY, data, options);
        return response;
    } catch (error) {
        return ThrowError("sendVideoAnalytics", error);
    }
};

export const fetchTrendingSearch = async (userId, languageCode) => {
    try {
        const response = await fetchData(
            API.SEARCH.TRENDING_SEARCH(userId ?? getUid(), languageCode ?? DEFAULT_LANGUAGE)
        );
        return response;
    } catch (error) {
        return ThrowError("fetchTrendingSearch", error);
    }
};

export const fetchSearchContentResult = async (
    searchParam = "",
    pageNum = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    options = {}
) => {
    try {
        if (!searchParam) throw new Error("Post Data Required");

        const data = {
            key: searchParam,
            userId: getUid(),
            languageId: DEFAULT_LANGUAGE.toString(),
            pageNo: pageNum,
            pageSize,
        };

        const response = await postData(API.SEARCH.SEACH_CONTENT, data, options);
        return response;
    } catch (error) {
        return ThrowError("fetchSearchContentResult", error);
    }
};

export const fetchRadioHomePageData = async () => {
    try {
        const response = await fetchData(API.RADIO.GET_RADIO_HOME_PAGE);
        return response;
    } catch (error) {
        return ThrowError("fetchTrendingSearch", error);
    }
};

export const fetchUserWishlistItems = async (pageNum, pageSize, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!token) throw new Error("User Token Not Found");

        const headers = { Authorization: token };

        const response = await fetchData(API.WISHLIST.GET_USER_WISHLIST_DATA(pageNum, pageSize), {
            ...options,
            headers,
        });

        return response;
    } catch (error) {
        return ThrowError("fetchUserWishlistItems", error);
    }
};

export const fetchPlayListContent = async (playListId, page, pageSize) => {
    try {
        const response = await fetchData(
            API.SEE_ALL_PLAYLIST_DATA.FETCH_PLAYLIST_DATA(
                playListId,
                page,
                pageSize,
                getUid(),
                DEFAULT_LANGUAGE,
                DEFAULT_CULTURE,
                DEFAULT_GENRE
            )
        );
        return response;
    } catch (error) {
        return ThrowError("fetchPlayListContent", error);
    }
};

export const fetchScreenSaverContent = async () => {
    try {
        const response = await fetchData(API.SCREENSAVER.FETCH_SCREENSAVER_CONTENT);
        return response;
    } catch (error) {
        return ThrowError("fetchScreenSaverContent", error);
    }
};


export const fetchBannerWatchMediaDetails = async(mediaId, openWebSeries = false, webSeriesId = 0, userObjectId = null)=>{
    try{
        const response = await fetchData(API.MEDIA.GET_WATCH_BANNER_MEDIA_DETAILS(mediaId, openWebSeries, webSeriesId, userObjectId ?? getUserObjectId()));
        return response;
    } catch(error){
        return ThrowError('fetchBannerWatchMediaDetails', error);
    }
}
