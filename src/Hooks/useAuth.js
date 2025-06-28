import { useEffect, useState } from "react";
import { fetchApiKeyandAppFeatures} from "../Service/AuthService";
import { useUserContext } from "../Context/userContext";
import { CACHE_KEYS, getCache, setCache } from "../Utils/DataCache";

const useAuth = () => {
    
    const [apiKey, setApiKey] = useState();
    const[isLoadingSession,setIsLoadingSession] = useState(true);
    const {logout,startAppSession,getUserAccountStatus,fetchUserProfileData} = useUserContext(); 
    useEffect(() => {
        const fetchAndSetApiKey = async () => {
            setIsLoadingSession(true);
            try {
                const cached = getCache(CACHE_KEYS.API_KEY.API_KEY_DATA);
                if(cached){
                    return;
                }

                const apikeyRes = await fetchApiKeyandAppFeatures();
                if (apikeyRes && apikeyRes.apiKey) {
                    localStorage.setItem('apiKey', apikeyRes.apiKey);
                    setApiKey(apikeyRes.apiKey);
                    setCache(CACHE_KEYS.API_KEY.API_KEY_DATA,apikeyRes.apiKey);
                }
                if (apikeyRes && apikeyRes.appIdleTime) {
                    localStorage.setItem('appIdleTime', apikeyRes.appIdleTime);
                    setCache(CACHE_KEYS.API_KEY.APP_IDLE_TIME,apikeyRes.appIdleTime);

                }
                if (apikeyRes && apikeyRes.minVersion) {
                    checkAppVersion(apikeyRes.minVersion);
                    setCache(CACHE_KEYS.API_KEY.APP_MIN_VERSION,apikeyRes.minVersion);
                }
                if(apikeyRes && apikeyRes.menu){
                    setCache(CACHE_KEYS.MENU.MENU_DATA,apikeyRes.menu);
                }
            } catch (error) {
                console.error('Failed to fetch and set API key:', error);
            } finally {
                setIsLoadingSession(false); // STEP 2: done fetching
            }
        };
        fetchAndSetApiKey();
    }, []);

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
                                    const widgetTag = xml.getElementsByTagName('widget')?.[0];
                                    const currentVersionStr = widgetTag?.attributes?.[3]?.value;


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

    const fetchApiKeyAndSetSession = async () => {
        try{
        const token = localStorage.getItem("userObjectId");
        if (token) {
            let res = await getUserAccountStatus();
            if(res){
            await startAppSession();
            await fetchUserProfileData();
            }
        } else {
            logout();
        }
    }catch(error){
    }
    }

    return {
        fetchApiKeyAndSetSession,
        apiKey,
        isLoadingSession
    };
}

export default useAuth