import axios from 'axios';
import { API_BASE_URL } from './constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
});

// Optional: reliable ping for actual connectivity
const isOnline = async () => {
  if (!navigator.onLine) return false;

  try {
    await fetch(API_BASE_URL+'User/GetUserActiveIndicator', {
      method: 'HEAD',
      cache: 'no-store',
      mode: 'no-cors',
    });
    return true;
  } catch (e) {
    return false;
  }
};

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const online = await isOnline();
    if (!online) {
      return Promise.reject(new Error('No Internet Connection'));
    }

    if (!config?.requireApiKey) {
      const storedApiKey = localStorage.getItem('apiKey');
      if (!storedApiKey) {
        console.error('apiKey not Set');
      }
      config.headers.ApiKey = storedApiKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
