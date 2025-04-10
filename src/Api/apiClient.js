// network/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-api-base-url.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
     'Access-Control-Allow-Origin': '*'
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers.ApiKey = 'KableONE@74#'
    // You can attach tokens here
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle errors globally here
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
