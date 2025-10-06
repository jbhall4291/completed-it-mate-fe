import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL! //"http://localhost:5000/api"  

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;