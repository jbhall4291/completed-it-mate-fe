// lib/axiosInstance.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

const isServer = typeof window === 'undefined';

const API_BASE = isServer
  ? process.env.BACKEND_API_URL
  : '/api/proxy';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  const headers = config.headers as AxiosHeaders;

  if (isServer) {
    if (process.env.API_KEY) {
      headers.set('x-api-key', process.env.API_KEY);
    }

    return config;
  }

  const uid = sessionStorage.getItem('clm_user_id_v2');

  if (uid) {
    headers.set('x-user-id', uid);
  }

  return config;
});

export default axiosInstance;