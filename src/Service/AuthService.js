import { fetchData, postData } from "../Api/apiService";
import { API } from "../Api/constants";
import { toast } from "react-toastify";
import { getDeviceInfo, getSanitizedToken } from "../Utils";

const deviceInfo = getDeviceInfo();

const ThrowError = (functionName, error) => {
  // toast.error(`Error in ${functionName}: ${error.message || error}`);
  console.error(`Api Error in ${functionName}: ${error.message || error}`);

  throw new Error(error.message || error);
};

export const fetchApiKeyandAppFeatures = async () => {
  try {
    const response = await fetchData(API.AUTH.GET_APIKEY, { requireApiKey: false });
    console.log('response for api', response);

    if (response && response?.isSuccess) {
      const {
        apiKey,
        appIdleTime,
        minVersions,
        isTVEnabled,
        isRadioEnabled,
        isVODEnabled,
        isMovieEnabled,
        isWebseriesEnabled,
        isGoogleCastEnabled
      } = response.data;

      return {
        isSuccess: response.isSuccess,
        data:{
        apiKey,
        appIdleTime,
        menu: {
          isTVEnabled,
          isRadioEnabled,
          isVODEnabled,
          isMovieEnabled,
          isWebseriesEnabled,
          isGoogleCastEnabled
        },
        minVersion: minVersions?.result?.data?.min_tizen,
      }
      };
    }else{
    throw new Error("Api Data Not Found, GET_APIKEY");
    }
  } catch (error) {
    return ThrowError("fetchApiKey", error);
  }
};

export const getUserAccountStatusV2 = async (data, options = {}) => {
  try {
    const token = getSanitizedToken();
    const uid = localStorage.getItem("uid");

    if (!token || !uid) throw new Error("JWT token or UID is missing");

    const new_data = {
      ...data,
      token: token.replace("Bearer ", ""),
      userId: uid,
      deviceId: deviceInfo.deviceId,
    };

    return await postData(API.AUTH.POST_USERACCOUNT_STATUS, new_data, options);
  } catch (error) {
    return ThrowError("getUserAccountStatusV2", error);
  }
};

export const getUserAppSession = async (data, options = {}) => {
  try {
    return await postData(API.AUTH.POST_APPSESSION, data, options);
  } catch (error) {
    return ThrowError("getUserAppSession", error);
  }
};

export const loginTv = async (data, options = {}) => {
  try {
    return await postData(API.AUTH.LOGIN, data, options);
  } catch (error) {
    return ThrowError("loginTv", error);
  }
};

export const logoutTv = async (data, options = {}) => {
  try {
    return await postData(API.AUTH.POST_LOGOUT_DEVICE, data, options);
  } catch (error) {
    return ThrowError("logoutTv", error);
  }
};

export const fetchUserProfile = async (data, options = {}) => {
  try {
    return await postData(API.AUTH.GET_USER_PROFILE, data, options);
  } catch (error) {
    return ThrowError("fetchUserProfile", error);
  }
};

export const fetchUserSubscriptionStatus = async (options = {}) => {
  try {
    const token = getSanitizedToken();
    if (!token) throw new Error("User Token Not Found");

    const headers = {
      Authorization: token,
    };

    return await fetchData(API.AUTH.GET_USER_SUBSCRIPTION_STATUS, {
      ...options,
      headers,
    });
  } catch (error) {
    return ThrowError("fetchUserSubscriptionStatus", error);
  }
};

export const fetchAppFeatures = async () => {
  try {
    return await fetchData(API.MENU.GET_APP_FEATURES) || [];
  } catch (error) {
    return ThrowError("fetchAppFeatures", error);
  }
};
