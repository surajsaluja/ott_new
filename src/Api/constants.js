const DEFAULTS = {
    USER_ID : 0,
    SECTION:5,
    PAGE: 1,
    PAGE_SIZE: 10,
    LANGUAGE_CODE: 1,
    MEDIA_ID: 0,
    USER_TOKEN_ID: 0
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
    },
    MOVIEDETAIL: {
        GET_MOVIE_DETAILS: (mediaId, userId) =>
            `/Media/GetMediaDetailsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${userId ?? DEFAULTS.USER_ID}`,
        GET_MEDIA_RELATED_ITEMS: (mediaId, languageCode, userTokenId, page, pageSize) =>
            `/Media/GetRelatedItemsV2/${mediaId ?? DEFAULTS.MEDIA_ID}/${languageCode ?? DEFAULTS.LANGUAGE_CODE}/${userTokenId ?? DEFAULTS.USER_TOKEN_ID}/${page ?? DEFAULTS.PAGE}/${pageSize ?? DEFAULTS.PAGE_SIZE}`,
    },
    WEBSERIES:{
        GET_WEBSERIES_DETAILS: (mediaId, userTokenId) =>
            `/Media/WebSeriesDetailsV3/${mediaId ?? DEFAULTS.MEDIA_ID}/${userTokenId ?? DEFAULTS.USER_TOKEN_ID}`,
    },
    MENU: {
        GET_APP_FEATURES: '/AdminApi/GetAppFeatures',
    },
};
