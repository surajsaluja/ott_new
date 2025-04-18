import React, { createContext, useContext, useState, useEffect } from "react";
import {
    loginTv,
    logoutTv,
    fetchUserProfile,
    fetchUserSubscriptionStatus,
    getUserAppSession,
    getUserAccountStatusV2
} from '../Service/AuthService'
import { getDeviceInfo } from "../Utils";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwttoken'));
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwttoken') || null);
    const [tokenId, setTokenId] = useState(localStorage.getItem('tokenId') || null);
    const [uid, setUid] = useState(localStorage.getItem('uid') || null);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [profileInfo, setProfileInfo] = useState(() => {
        const saved = localStorage.getItem('profileData');
        return saved ? JSON.parse(saved) : null;
    });
    const [isUserSubscribed, setIsUserSubscribed] = useState(
        localStorage.getItem('isUserSubscribed') === 'true'
    );
    const deviceInfo = getDeviceInfo();

    const handleOTPLogin = async (inputOTP) => {
        let message = null;
        let loginStatus = false;
        try {
            const data = {
                "OTPToken": inputOTP,
                "deviceID": deviceInfo.deviceId,
                "deviceName": deviceInfo.deviceName,
                "deviceOS": deviceInfo.deviceOS,
                "deviceType": "Tizen"
            }
            const response = await loginTv(data);
            if (response.status) {
                const data = response.data;
                loginStatus = true;
                setIsLoggedIn(true);
                setJwtToken(data.token);
                setTokenId(data.tokenId);
                setUid(data.id);
                localStorage.setItem('jwttoken', data.token);
                localStorage.setItem('tokenId', data.tokenId);
                localStorage.setItem('uid', data.id);
                message = 'User Logged In Successfully'
                await fetchProfile(data.tokenId, data.id);
                startAppSession();
            } else {
                setIsLoggedIn(false);
                setJwtToken(null);
                setTokenId(null);
                message = response.message || "Login failed!";
            }
        } catch (error) {
            console.error("Login Error", error);
        }
        finally {
            return {
                isLoggedIn: loginStatus,
                message,
            };
        }
    };

    const fetchProfile = async (tokenIdParam, uidParam) => {
        const tokenId = tokenIdParam || localStorage.getItem('tokenId');
        const userId = uidParam || localStorage.getItem('uid');
        if (!tokenId || !userId) {
            return false;
        }

        try {
            const data = {
                "TokenId": tokenId
            };
            const response = await fetchUserProfile(data);
            if (response.status) {
                const data = response.data;
                const profile = {
                    username: data.name,
                    email: data.emailId,
                    mobile: data.phoneNumber,
                    planname: data.subscriptionName,
                    expiredate: data.expireOn,
                    countryDialCode: data.countryDialCode,
                    mobileWithDialCode: `${data.countryDialCode}-${data.phoneNumber}`,
                    userId: uidParam
                };
                setProfileInfo(profile);
                setIsUserSubscribed(data.isSubscriptionActive);

                localStorage.setItem('profileData', JSON.stringify(profile));
                localStorage.setItem('isUserSubscribed', data.isSubscriptionActive);
            }
        } catch (error) {
            console.error("Profile fetch error", error);
        }
    };

    const getUserSubscriptionStatus = async () => {
        const response = await fetchUserSubscriptionStatus();
        if (response.statusCode == 200 && (response.isUserSubscribed || response.isUserSubscribed == 'true')) {
            setIsUserSubscribed(true);
        }
        else {
            setIsUserSubscribed(false);
        }
        return response;
    }



const startAppSession = async () => {

    const appStartTime = new Date();
    const data = {
        "TokenId": localStorage.getItem('tokenId'),
        "StartTime": appStartTime,
        "DeviceId": deviceInfo.deviceId,
        "DeviceName": deviceInfo.deviceName,
        "DeviceType": 5
    };

    const appSessionData = await getUserAppSession(data);
    if (appSessionData && appSessionData.appSessionId) {
        setSessionStartTime(appStartTime);
        setSessionId(appSessionData.appSessionId);
    }
};

const endAppSession = async () => {

    if (sessionId && sessionStartTime) {
        const sessionEndTime = new Date();
        const data = {
            "TokenId": localStorage.getItem('tokenId'),
            "StartTime": sessionStartTime,
            "EndTime": sessionEndTime,
            "DeviceId": deviceInfo.deviceID,
            "DeviceName": deviceInfo.deviceName,
            "AppSessionId": sessionId,
            "DeviceType": 5
        };

        const appSessionData = await getUserAppSession(data);
        if (appSessionData && appSessionData.appSessionId) {
            localStorage.setItem('appSessionId', appSessionData.appSessionId);
            setSessionId(appSessionData.appSessionId);
        }
    }
};

const getUserAccountStatus = async () => {
    try {
        const response = await getUserAccountStatusV2();

        const responseData = response?.data;
        if (responseData?.token) {
            localStorage.setItem('jwttoken', JSON.stringify(responseData.token));
            setJwtToken(responseData.token);
        }

        if (!responseData?.isactive) {
            logout();
        }
    } catch (error) {
        console.error(error);
    }
};


const logout = async () => {
    let token = localStorage.getItem('jwttoken');
    if (token) {
        const data = {
            "deviceId": deviceInfo.deviceId,
            "TokenAuthId": jwtToken,
            "tokenId": tokenId
        }

        const response = await logoutTv(data);
        if (response.isSuccess) {
            endAppSession();
        }
    }

    setIsLoggedIn(false);
    setJwtToken(null);
    setTokenId(null);
    setProfileInfo(null);
    setUid(null);
    setIsUserSubscribed(false);
    localStorage.removeItem('tokenId');
    localStorage.removeItem('appSessionId');
    localStorage.removeItem('isUserSubscribed');
    localStorage.removeItem('jwttoken');
    localStorage.removeItem('uid');
    localStorage.removeItem('profileData');
};

return (
    <UserContext.Provider
        value={{
            isLoggedIn,
            jwtToken,
            tokenId,
            uid,
            profileInfo,
            isUserSubscribed,
            startAppSession,
            endAppSession,
            handleOTPLogin,
            logout,
            getUserSubscriptionStatus,
            getUserAccountStatus
        }}
    >
        {children}
    </UserContext.Provider>
);
};

export const useUserContext = () => useContext(UserContext);
