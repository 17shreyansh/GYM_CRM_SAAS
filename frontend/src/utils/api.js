import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Enable cookies
});

// Remove token interceptor since we're using cookies
api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.gym_suspended) {
      window.location.href = '/gym-suspended';
    } else if (error.response?.data?.subscription_required || error.response?.data?.subscription_expired) {
      window.location.href = '/subscription-required';
    }
    return Promise.reject(error);
  }
);

export default api;