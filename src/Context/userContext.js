import React, { createContext, useContext, useState, useEffect } from "react";
import {
    LoginTv,
    fetchUserProfile,
} from '../Service'
import { getDeviceInfo } from "../Utils";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jwttoken'));
    const [token, setToken] = useState(localStorage.getItem('jwttoken') || null);
    const [uid, setUid] = useState(localStorage.getItem('uid') || null);
    const [profileInfo, setProfileInfo] = useState(() => {
        const saved = localStorage.getItem('profileData');
        return saved ? JSON.parse(saved) : {};
    });
    const [isUserSubscribed, setIsUserSubscribed] = useState(
        localStorage.getItem('isUserSubscribed') === 'true'
    );
    const deviceInfo = getDeviceInfo();

    const handleOTPLogin = async (inputOTP) => {
        let message = null;
        try {
            const data = {
                "OTPToken": inputOTP,
	  			"deviceID": deviceInfo.deviceId,
	  			"deviceName": deviceInfo.deviceName,
	  			"deviceOS": deviceInfo.deviceOS,
	  			"deviceType": "Tizen"
            }
            const response = await LoginTv(data);
            if (response.status) {
                const data = response.data;
                setIsLoggedIn(true);
                setToken(data.token);
                setUid(data.id);
                localStorage.setItem('jwttoken', data.token);
                localStorage.setItem('tokenId',data.tokenId);
                localStorage.setItem('uid', data.id);
                message = 'User Logged In Successfully'

                await fetchProfile(data.tokenId);
            } else {
                setIsLoggedIn(false);
                setToken(null);
                message = response.message || "Login failed!";
            }
        } catch (error) {
            console.error("Login Error", error);
        }
        finally{
            return {
                isLoggedIn,
                message,
            };
        }
    };

    const fetchProfile = async () => {
        let tokenId = localStorage.getItem('tokenId')
        if(!tokenId)
        {
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

    const logout = () => {
        setIsLoggedIn(false);
        setToken(null);
        setProfileInfo({});
        localStorage.removeItem('jwttoken');
        localStorage.removeItem('uid');
        localStorage.removeItem('profileData');
        localStorage.removeItem('isUserSubscribed');
    };


    return (
        <UserContext.Provider
            value={{
                isLoggedIn,
                token,
                uid,
                profileInfo,
                isUserSubscribed,
                handleOTPLogin,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
