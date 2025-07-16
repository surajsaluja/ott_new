import axios from 'axios';
import { API_BASE_URL } from './constants';

let setIsDeviceOfflineExternal = () => {};

export const setNetworkSetter = (setter) => {
  setIsDeviceOfflineExternal = setter;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!config?.requireApiKey) {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        console.error('apiKey not Set');
      }
      config.headers.ApiKey = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    setIsDeviceOfflineExternal(false); // Response succeeded
    return response;
  },
  (error) => {
    if (!error.response) {
      console.warn('No API response - setting device offline');
      setIsDeviceOfflineExternal(true);
    }
    console.error('API Error:', error.message || error.response);
    return Promise.reject('No Internet Connection');
  }
);

export default apiClient;
