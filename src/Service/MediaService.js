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
const DEFAULT_CULTURE = 0;
const DEFAULT_GENRE = 0;
const userObjId = localStorage.getItem('userObjectId') ?? null;
const uid = localStorage.getItem('uid') ?? null;

const ThrowError = (functionName, error) => {
    toast.error(`Error in ${functionName}: ${error.message || error}`);
    console.error(`Api Error At ${functionName}:`, error);
    throw new Error(error);
};

export const fetchHomePageData = async (userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_HOMEPAGE_DATA(userId ?? uid));
        return response?.data || [];
    } catch (error) {
        return ThrowError("fetchHomePageData", error);
    }
};

export const fetchBannersBySection = async (section, language = null, userId = null) => {
    try {
        const response = await fetchData(API.HOMEPAGE.GET_BANNER_DATA(section ?? DEFAULT_SECTION, language ?? DEFAULT_LANGUAGE, userId ?? uid));
        return response || null;
    } catch (error) {
        return ThrowError('fetchBannersBySection', error);
    }
}

export const fetchPlaylistPage = async (section, page, userId = null) => {
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

export const fetchMediaRelatedItem = async (mediaId = null, userId = null, page = 1, pageSize = 10, language = 1, options = {}) => {
    try {
        if(!mediaId) throw new Error('MediaId is required field');
        const response = await fetchData(API.MEDIA.GET_MEDIA_RELATED_ITEMS(mediaId, language ?? DEFAULT_LANGUAGE, userId ?? uid, page ?? DEFAULT_PAGE, pageSize ?? RELATED_MEDIA_DEFAULT_PAGE_SIZE), options);
        return response;
    } catch (error) {
        return ThrowError('getRelatedMedia', error);

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

export const fetchWebSeriesEpisodeBySeasonId = async (webSeriesId, seasonId, language, userObjectId, page, pageSize) => {
    try {
        if (!webSeriesId || webSeriesId == null) {
            throw Error('Webseries ID is an compulsary field');
        }
        if (!seasonId || seasonId == null) {
            throw Error('Season Id is an compulsary field');
        }
        const response = await fetchData(API.MEDIA.GET_WEBSERIES_EPISODES(webSeriesId, seasonId, language ?? DEFAULT_LANGUAGE, userObjectId ?? userObjectId, page ?? DEFAULT_PAGE, pageSize ?? DEFAULT_PAGE_SIZE));
        return response;

    } catch (error) {
        return ThrowError('fetchWebSeriesEpisodeBySeasonId', error);
    }
}

export const updateMediaItemToWishlist = async (data, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!data) throw new Error("Post Data Required");
        if (!token) throw new Error("User Token Not Found");

        const headers = {
            Authorization: token,
        };

        const response = await postData(API.MEDIA.POST_FAVOURITE_MEDIA_ITEM, data, {
            ...options,
            headers,
        });
        return response;
    } catch (error) {
        return ThrowError("fetchUserSubscriptionStatus", error);
    }
}

export const sendVideoAnalytics = async (data, options) => {
    try {
        if (!data) throw new Error("Post Data Required");
        const response = await postData(API.MEDIA.POST_PLAY_HISTORY, data, options);
        return response;
    } catch (error) {
        return ThrowError("sendVideoAnalytics", error);
    }
}

export const fetchTrendingSearch = async (userId, languageCode) => {
    try {
        const response = await fetchData(API.SEARCH.TRENDING_SEARCH(userId ?? uid, languageCode ?? DEFAULT_LANGUAGE));
        return response;

    } catch (error) {
        return ThrowError("fetchTrendingSearch", error);
    }
}

export const fetchSearchContentResult = async (searchParam = "",pageNum =1, pageSize = 10, options = {}) => {
    try {
        if (!searchParam) { throw new Error('Post Data Required') };

        const data = {
            key: searchParam,
            userId: uid,
            languageId: DEFAULT_LANGUAGE.toString(),
            pageNo: pageNum,
            pageSize: pageSize
        };
        const response = await postData(API.SEARCH.SEACH_CONTENT, data, options);
        return response;

    } catch (error) {
        return ThrowError("fetchSearchContentResult", error);
    }
}

export const fetchRadioHomePageData = async()=>{
    try {
        const response = await fetchData(API.RADIO.GET_RADIO_HOME_PAGE);
        return response;

    } catch (error) {
        return ThrowError("fetchTrendingSearch", error);
    }

}

export const fetchUserWishlistItems = async (pageNum,pageSize, options = {}) => {
    try {
        const token = getSanitizedToken();
        if (!token) throw new Error("User Token Not Found");

        const headers = {
            Authorization: token,
        };

        const response = await fetchData(API.WISHLIST.GET_USER_WISHLIST_DATA(pageNum, pageSize), {
            ...options,
            headers
        });

        return response;
    } catch (error) {
        return ThrowError('fetchUserWishlistItems', error);
    }
}

export const fetchPlayListContent = async(playListId, page, pageSize)=>{
    try {
        const response = await fetchData(API.SEE_ALL_PLAYLIST_DATA.FETCH_PLAYLIST_DATA(playListId,page,pageSize,uid,DEFAULT_LANGUAGE,DEFAULT_CULTURE,DEFAULT_GENRE));
        return response;

    } catch (error) {
        return ThrowError("fetchTrendingSearch", error);
    }
}

