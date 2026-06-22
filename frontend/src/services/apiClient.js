import axios from 'axios';

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
      const storedRT = localStorage.getItem('sonora_rt');
      const { data } = await api.post('/auth/refresh', { refreshToken: storedRT });
      const newAccessToken = data.data.accessToken;
      setAccessToken(newAccessToken);
      if (data.data.refreshToken) {
        try { localStorage.setItem('sonora_rt', data.data.refreshToken); } catch (_) {}
      }
      isRefreshing = false;
      onRefreshed(newAccessToken);

      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(config);
    } catch (refreshError) {
      isRefreshing = false;
      setAccessToken(null);
      try { localStorage.removeItem('sonora_rt'); } catch (_) {}
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
