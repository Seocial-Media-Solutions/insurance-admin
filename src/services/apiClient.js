import axios from 'axios';

import { API } from '../utils/api';

const API_BASE_URL = API;

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Unauthorized - you might want to handle this in AuthContext instead of redirecting here
            // but for now, we leave it or clear local state
        }
        return Promise.reject(error);
    }
);

export default apiClient;
