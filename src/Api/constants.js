const  BASE_URL = `https://liveapi.kableone.com/Api`;
export const API = {
    AUTH:{
        // login to TV using OTP
        LOGIN:`${BASE_URL}/LiveTV/TVLogin`,
        // to check the user status at any time
        POST_USERACCOUNT_STATUS: `${BASE_URL}/Account/GetUserAccountStatusv2`,
        POST_APPSESSION:`${BASE_URL}/LiveTV/AppProgress`,
        GET_APIKEY:`${BASE_URL}/Account/GetApikeyV2`,
        GET_USERACTIVE_INDICATOR: `${BASE_URL}/User/GetUserActiveIndicator`,
        POST_LOGOUT_DEVICE: `${BASE_URL}'/Account/LogoutDevice`
    },
    HOMEPAGE:{
        // GET 1st homepage data
        GET_HOMEPAGE_DATA: (userId)=> `${BASE_URL}/Content/GetHomeData?section=Home&userId=${userId ?? 0}&source=tv`,
        // GET homepage data for pagination
        GET_PLAYLIST_DATA: (section, userId, page, pageSize) => `${BASE_URL}/Content/GetPlaylistData/${section ?? 5}/${userId ?? 0}/${page ?? 1}/${pageSize ?? 10}`,
        // get continue watching data and insert to first row
        GET_CONTINUE_WATCH: (userId) => `${BASE_URL}/Content/GetContinueWatchRail?section=Home&userId=${userId ?? 0}`,
    },
    MOVIEDETAIL:{
        GET_MOVIE_DETAILS:(mediaId,userTokenId)=>`${BASE_URL}/Media/GetMediaDetailsV2/${mediaId ?? 0}/${userTokenId ?? 0}`,
        GET_MEDIA_RELATED_ITEMS:(mediaId, languageCode, userTokenId, page, pageSize)=>`${BASE_URL}/Media/GetRelatedItemsV2/${mediaId}/${languageCode ?? 1}/${userTokenId ?? 0}/${page ?? 1}/${pageSize ?? 10}`
    },
    MENU:{
        GET_APP_FEATURES:`${BASE_URL}/AdminApi/GetAppFeatures`
    }
}
