import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://testapi.kableone.com/Api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (!config?.requireApiKey) {
      let storedApiKey = localStorage.getItem('apiKey');
      if (!storedApiKey) {
        console.log('apiKey not Set');
      }
      config.headers.ApiKey = storedApiKey;
    }
    // You can attach tokens here
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
