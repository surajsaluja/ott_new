export const API = {
    AUTH: {
        LOGIN: '/LiveTV/TVLogin',
        POST_USERACCOUNT_STATUS: '/Account/GetUserAccountStatusv2',
        POST_APPSESSION: '/LiveTV/AppProgress',
        GET_APIKEY: '/Account/GetApikeyV2',
        GET_USERACTIVE_INDICATOR: '/User/GetUserActiveIndicator',
        POST_LOGOUT_DEVICE: '/Account/LogoutDevice',
        GET_USER_PROFILE: '/LiveTV/Profile'
    },
    HOMEPAGE: {
        GET_HOMEPAGE_DATA: (userId) =>
            `/Content/GetHomeData?section=Home&userId=${userId ?? 0}&source=tv`,
        GET_PLAYLIST_DATA: (section, userId, page, pageSize) =>
            `/Content/GetPlaylistData/${section ?? 5}/${userId ?? 0}/${page ?? 1}/${pageSize ?? 10}`,
        GET_CONTINUE_WATCH: (userId) =>
            `/Content/GetContinueWatchRail?section=Home&userId=${userId ?? 0}`,
    },
    MOVIEDETAIL: {
        GET_MOVIE_DETAILS: (mediaId, userTokenId) =>
            `/Media/GetMediaDetailsV2/${mediaId ?? 0}/${userTokenId ?? 0}`,
        GET_MEDIA_RELATED_ITEMS: (mediaId, languageCode, userTokenId, page, pageSize) =>
            `/Media/GetRelatedItemsV2/${mediaId}/${languageCode ?? 1}/${userTokenId ?? 0}/${page ?? 1}/${pageSize ?? 10}`,
    },
    MENU: {
        GET_APP_FEATURES: '/AdminApi/GetAppFeatures',
    },
};
