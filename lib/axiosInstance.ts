// lib/axiosInstance.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!  // 'http://localhost:5000/api';

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
  headers.set('x-api-key', process.env.NEXT_PUBLIC_API_KEY);
  if (uid) headers.set('x-user-id', uid);

  return config;
});

export default axiosInstance;
