import axios from 'axios';

const API_BASE = "http://localhost:5000/api" // process.env.NEXT_PUBLIC_API_URL!; 

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;