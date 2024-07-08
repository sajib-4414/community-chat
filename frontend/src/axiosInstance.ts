import axios from "axios";
const env = await import.meta.env;
const BASE_URL = env.VITE_APP_API_URL || 'http://localhost:3001/api'; // Default URL

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Add other axios configurations here
    timeout: 10000, // Set timeout in milliseconds (optional)
    headers: {
      'Content-Type': 'application/json', // Default content type (optional)
    },
  });