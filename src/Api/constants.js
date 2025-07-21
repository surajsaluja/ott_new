const DEFAULTS = {
    USER_ID : 0,
    SECTION:5, // 5 FOR HOME,2 FOR WEB SERIES,1 FOR MOVIES
    PAGE: 1,
    PAGE_SIZE: 10,
    LANGUAGE_CODE: 1,
    MEDIA_ID: 0,
    WEBSERIES_ID: 74,
    SEASON_ID: 51,
    USER_OBJECT_ID: 0,
    DEFAULT_CHANNEL_HANDLE_NAME: ''
}
export const API_BASE_URL = 'https://testapi.kableone.com/api/';

export const API = {
    AUTH: {
        LOGIN: 'LiveTV/TVLogin',
        POST_USERACCOUNT_STATUS: 'Account/GetUserAccountStatusv2',
        POST_APPSESSION: 'LiveTV/AppProgress',
        GET_APIKEY: 'Account/GetApikeyNew',
        GET_USERACTIVE_INDICATOR: 'User/GetUserActiveIndicator',
        POST_LOGOUT_DEVICE: 'Account/LogoutDevice',
        GET_USER_PROFILE: 'LiveTV/Profile',
        GET_USER_SUBSCRIPTION_STATUS: 'User/GetSubscriptionStatus'
    },
    HOMEPAGE: {
        GET_HOMEPAGE_DATA: (userId) =>
            `Content/GetHomeData?section=Home&userId=${userId ?? DEFAULTS.USER_ID}&source=tv`,
        GET_PLAYLIST_DATA: (section, userId, page, pageSize) =>
            `Content/GetPlaylistData/${section ?? DEFAULTS.SECTION}/${userId ?? DEFAULTS.USER_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_sIZE}`,
        GET_CONTINUE_WATCH: (userId) =>
            `Content/GetContinueWatchRail?section=Home&userId=${userId ?? DEFAULTS.USER_ID}`,
        GET_BANNER_DATA:(section,languageCode,userId) =>
            `Content/GetPromotionItems/Banner/${section ?? DEFAULTS.SECTION}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userId ?? DEFAULTS.USER_ID}/tv`
    },
    MEDIA: {
        GET_MOVIE_DETAILS: (mediaId, userObjectId) =>
            `Media/GetMediaDetailsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_MEDIA_RELATED_ITEMS: (mediaId, languageCode, userObjectId, page, pageSize) =>
            `Media/GetRelatedItemsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
        GET_TOKENIZED_MEDIA_URL : (mediaId, userObjectId) =>
            `Media/GetTokanizedMediaUrlV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_WEBSERIES_DETAILS: (mediaId, userObjectId) =>
            `Media/WebSeriesDetailsV3/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_RECENT_WEBSEREIES_DETAILS: (mediaId, userObjectId,openWebSeries,webSeriesId)=>
            `Media/GetRecentWebSeriesDetail/?MediaId=${mediaId}&userId=${userObjectId}&OpenWebSeries=${openWebSeries}&WebSeriesId=${webSeriesId}`,
        GET_WEBSERIES_EPISODES:(webSeriesId,seasonId,languageCode,userObjectId,page,pageSize) =>
            `Media/GetEpisodeItemsV2/${webSeriesId ?? DEFAULTS.WEBSERIES_ID}/${seasonId ?? DEFAULTS.SEASON_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
        GET_WEBSERIES_DETAILS_WITH_EPISODES:(webSeriesId,userObjectId) =>
            `Media/WebSeriesDetailsV4/${webSeriesId ?? DEFAULTS.WEBSERIES_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        POST_FAVOURITE_MEDIA_ITEM:`User/AddToMylist`,
        POST_PLAY_HISTORY:'Subscription/PlayHistoryNew'
    },
    MENU: {
        GET_APP_FEATURES: 'AdminApi/GetAppFeatures',
    },
    LIVETV:{
        GET_TV_HOME_PAGE_DATA : 'LiveTV/ChannelCategoriesV2?source=TV',
        GET_ALL_CHANNEL_SCHEDULE: 'LiveTV/AllScheduled',
        GET_CHANNEL_SCHEDULE:(channelHandleName) => 
            `LiveTV/WatchChannel/${channelHandleName ?? DEFAULTS.DEFAULT_CHANNEL_HANDLE_NAME}`,
        GET_TOKENIZED_MEDIA_TV_URL: (channelHandleName, userObjectId) => 
            `LiveTV/GetTokanizedLiveTVUrlV2/${channelHandleName ?? DEFAULTS.DEFAULT_CHANNEL_HANDLE_NAME}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        SAVE_CHANNEL_PROGRESS:'LiveTV/ChannelProgress'
    },
    SEARCH:{
        TRENDING_SEARCH: (userId,languageCode) => 
            `Media/TrendingContent/${userId ?? DEFAULTS.USER_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}`,
        SEACH_CONTENT:`Media/SearchMedia`
    },
    RADIO:{
        GET_RADIO_HOME_PAGE:`Radio/Index?source=web`
    },
    WISHLIST:{
        GET_USER_WISHLIST_DATA:(pageNum,pageSize) => `User/GetUserPlaylist/${pageNum ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
    },
    SEE_ALL_PLAYLIST_DATA:{
        FETCH_PLAYLIST_DATA:(playListId,page,pageSize,userId,language,culture,genre)=>
            `Content/GetPlaylistItems/${playListId}/${page??DEFAULTS.PAGE}/${pageSize??DEFAULTS.PAGE_SIZE}/${userId ?? DEFAULTS.USER_ID}/${language ?? DEFAULTS.LANGUAGE_CODE}/${culture}/${genre}`
    },
    SCREENSAVER:{
        FETCH_SCREENSAVER_CONTENT: `Content/GetScreenSaverContent`
    }
};
