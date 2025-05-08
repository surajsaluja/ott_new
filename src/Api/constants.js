const DEFAULTS = {
    USER_ID : 0,
    SECTION:5, // 5 FOR HOME,2 FOR WEB SERIES,1 FOR MOVIES
    PAGE: 1,
    PAGE_SIZE: 10,
    LANGUAGE_CODE: 1,
    MEDIA_ID: 0,
    WEBSERIES_ID: 74,
    SEASON_ID: 51,
    USER_OBJECT_ID: 0
}


export const API = {
    AUTH: {
        LOGIN: '/LiveTV/TVLogin',
        POST_USERACCOUNT_STATUS: '/Account/GetUserAccountStatusv2',
        POST_APPSESSION: '/LiveTV/AppProgress',
        GET_APIKEY: '/Account/GetApikeyV2',
        GET_USERACTIVE_INDICATOR: '/User/GetUserActiveIndicator',
        POST_LOGOUT_DEVICE: '/Account/LogoutDevice',
        GET_USER_PROFILE: '/LiveTV/Profile',
        GET_USER_SUBSCRIPTION_STATUS: '/User/GetSubscriptionStatus'
    },
    HOMEPAGE: {
        GET_HOMEPAGE_DATA: (userId) =>
            `/Content/GetHomeData?section=Home&userId=${userId ?? DEFAULTS.USER_ID}&source=tv`,
        GET_PLAYLIST_DATA: (section, userId, page, pageSize) =>
            `/Content/GetPlaylistData/${section ?? DEFAULTS.SECTION}/${userId ?? DEFAULTS.USER_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_sIZE}`,
        GET_CONTINUE_WATCH: (userId) =>
            `/Content/GetContinueWatchRail?section=Home&userId=${userId ?? DEFAULTS.USER_ID}`,
        GET_BANNER_DATA:(section,languageCode,userId) =>
            `/Content/GetPromotionItems/Banner/${section ?? DEFAULTS.SECTION}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userId ?? DEFAULTS.USER_ID}/tv4`
    },
    MEDIA: {
        GET_MOVIE_DETAILS: (mediaId, userObjectId) =>
            `/Media/GetMediaDetailsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_MEDIA_RELATED_ITEMS: (mediaId, languageCode, userObjectId, page, pageSize) =>
            `/Media/GetRelatedItemsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
        GET_TOKENIZED_MEDIA_URL : (mediaId, userObjectId) =>
            `Media/GetTokanizedMediaUrlV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_WEBSERIES_DETAILS: (mediaId, userObjectId) =>
            `/Media/WebSeriesDetailsV3/${mediaId ?? DEFAULTS.MEDIA_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        GET_WEBSERIES_EPISODES:(webSeriesId,seasonId,languageCode,userObjectId,page,pageSize) =>
            `/Media/GetEpisodeItemsV2/${webSeriesId ?? DEFAULTS.WEBSERIES_ID}/${seasonId ?? DEFAULTS.SEASON_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
        GET_WEBSERIES_DETAILS_WITH_EPISODES:(webSeriesId,userObjectId) =>
            `/Media/WebSeriesDetailsV4/${webSeriesId ?? DEFAULTS.WEBSERIES_ID}/${userObjectId ?? DEFAULTS.USER_OBJECT_ID}`,
        POST_FAVOURITE_MEDIA_ITEM:`User/AddToMylist`,
    },
    MENU: {
        GET_APP_FEATURES: '/AdminApi/GetAppFeatures',
    },
};
