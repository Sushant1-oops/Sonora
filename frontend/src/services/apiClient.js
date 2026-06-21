import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';



const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});






let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});



let isRefreshing = false;
let refreshSubscribers = [];

function subscribeToRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      toast.error('No internet connection');
      return Promise.reject(error);
    }

    if (response?.status !== 401 || config._retried || config.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    config._retried = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeToRefresh((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(config));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.data.accessToken);
      isRefreshing = false;
      onRefreshed(data.data.accessToken);

      config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(config);
    } catch (refreshError) {
      isRefreshing = false;
      setAccessToken(null);
      
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
