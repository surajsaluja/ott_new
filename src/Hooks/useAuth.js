import { useEffect, useState } from "react";
import { fetchApiKey, getUserSubscriptionStatus, getUserAccountStatusV2 } from "../Service";
import { getDeviceInfo } from "../Utils";

const useAuth = () => {

    const [apiKey, setApiKey] = useState(null);
    const deviceInfo = getDeviceInfo();

    const fetchAndSetApiKey = async () => {
        try {
          const storedKey = localStorage.getItem('apiKey');
          if (!storedKey) {
            const apikeyRes = await fetchApiKey();
            if (apikeyRes && apikeyRes.apiKey) {
              localStorage.setItem('apiKey', apikeyRes);
            }
            if(apikeyRes && apikeyRes.appIdleTime){
                localStorage.set('appIdleTime',apikeyRes.appIdleTime)
              }
              if(apikeyRes && apikeyRes.minVersion){
              checkAppVersion(apikeyRes.minVersion);
              }
          } 
        } catch (error) {
          console.error('Failed to fetch and set API key:', error);
        }
      };
      
    const checkAppVersion = (minVersion) => {
        let tizen = window.tizen;
        try {
            if (tizen && typeof tizen !== 'undefined' && tizen.filesystem) {
                tizen.filesystem.resolve(
                    'wgt-package/',
                    function (dir) {
                        dir.listFiles(function (files) {
                            const configFile = files.find(file => file.name === 'config.xml');
                            if (configFile) {
                                configFile.readAsText(function (text) {
                                    const xml = new DOMParser().parseFromString(text, 'text/xml');
                                    const currentVersionStr = xml.getElementsByTagName('widget')[0].attributes[3].value;

                                    const cleanedVersion = currentVersionStr.slice(0, currentVersionStr.lastIndexOf('.'));
                                    const currentVersion = parseFloat(cleanedVersion);

                                    if (currentVersion < minVersion) {
                                        alert('Update is available, Please update your App!');
                                        tizen.application.getCurrentApplication().exit();
                                    }
                                }, (err) => console.error('Read config error:', err), 'UTF-8');
                            }
                        }, (err) => console.error('List files error:', err));
                    },
                    (err) => console.error('Resolve error:', err),
                    'r'
                );
            }
        } catch (err) {
            console.error('Version check error:', err);
        }
    };

    const getAppSession = async () => {

        const appStartTime = new Date();
        const data = {
            TokenId: localStorage.getItem('token'),
            StartTime: appStartTime,
            DeviceId: deviceInfo.deviceId,
            DeviceName: deviceInfo.deviceName,
            DeviceType: 5
        };

        const appSessionData = await getUserSubscriptionStatus(data);
        if(appSessionData && appSessionData.appSessionId){
            localStorage.setItem('appSessionId', appSessionData.appSessionId);

        }
    };

    const getUserAccountStatus = async () => {
        let jwttoken = localStorage.getItem('jwttoken')?.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
        const uid = localStorage.getItem('uid');

        const data = {
            token: jwttoken,
            userId: uid,
            deviceId: deviceInfo.deviceId
        };

        try {
            const response = await getUserAccountStatusV2(data);

            const responseData = response.data.data;
            if (responseData?.token) {
                localStorage.setItem('jwttoken', JSON.stringify(responseData.token));
            }

            if (!responseData?.isactive) {
                localStorage.removeItem('token');
                localStorage.removeItem('profileData');
                window.location.href = '/profsettings';
            }
        } catch (error) {
            alert('Something went wrong while validating user status');
            console.error(error);
        }
    };

    const fetchApiKeyAndSetSession = () =>{
        fetchAndSetApiKey();
        if(window.localStorage.getItem("token")){
            getAppSession();   
            getUserAccountStatus();
        }
    }

    return {
        apiKey,
        fetchApiKeyAndSetSession,
      };
}

export default useAuth