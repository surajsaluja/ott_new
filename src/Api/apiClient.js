import axios from 'axios';
import { API_BASE_URL } from './constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cached ping status (10s window)
let lastCheck = 0;
let lastStatus = true;

const isOnline = async () => {
  if (!navigator.onLine) return false;

  const now = Date.now();
  if (now - lastCheck < 10000) {
    return lastStatus;
  }

  try {
    const res = await fetch(API_BASE_URL + 'User/GetUserActiveIndicator', {
      method: 'GET',
      cache: 'no-store',
    });
    lastCheck = now;
    lastStatus = res.ok;
    return res.ok;
  } catch {
    lastCheck = now;
    lastStatus = false;
    return false;
  }
};

apiClient.interceptors.request.use(
  async (config) => {
    if (!config?.requireApiKey) {
      const online = await isOnline();
      if (!online) {
        return Promise.reject(new Error('No Internet Connection'));
      }

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

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
