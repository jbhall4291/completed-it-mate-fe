// lib/axiosInstance.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

const API_BASE = "/api/proxy";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const uid = typeof window !== 'undefined'
    ? sessionStorage.getItem('clm_user_id_v2')
    : null;

  // Ensure we have an AxiosHeaders instance
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  const headers = config.headers as AxiosHeaders;

  if (uid) { headers.set('x-user-id', uid); }

  return config;
});

export default axiosInstance;