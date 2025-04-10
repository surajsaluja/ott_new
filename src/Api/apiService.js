import apiClient from './apiClient';

export const fetchData = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postData = async (url, payload, config = {}) => {
  try {
    const response = await apiClient.post(url, payload, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add other verbs if needed
export const putData = async (url, payload, config = {}) => {
  try {
    const response = await apiClient.put(url, payload, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
