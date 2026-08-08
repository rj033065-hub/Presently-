import axios from 'axios';
import { API_BASE_URL } from './constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore
      if (window.Clerk && window.Clerk.session) {
        // @ts-ignore
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Ignore if session not active
    }
  }
  return config;
});

export default apiClient;
