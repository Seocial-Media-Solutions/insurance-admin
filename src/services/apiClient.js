// import axios from 'axios';

// import { API } from '../utils/api';

// const API_BASE_URL = API;

// // Create axios instance with default config
// const apiClient = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor
// apiClient.interceptors.request.use(
//     (config) => {
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor for handling errors globally
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle common errors
//         if (error.response?.status === 401) {
//             // Unauthorized - you might want to handle this in AuthContext instead of redirecting here
//             // but for now, we leave it or clear local state
//         }
//         return Promise.reject(error);
//     }
// );

// export default apiClient;
import axios from 'axios';
import { API } from '../utils/api';

const API_BASE_URL = API;

// 🔥 Global Throttle Manager
class ApiThrottle {
    constructor(delay = 5000) {
        this.delay = delay;
        this.queue = Promise.resolve();
    }

    enqueue(config) {
        this.queue = this.queue.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(config), this.delay);
            });
        });

        return this.queue;
    }
}

const apiThrottle = new ApiThrottle(5000);

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Request interceptor (THROTTLE HERE)
apiClient.interceptors.request.use(
    async (config) => {
        return await apiThrottle.enqueue(config);
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // handle auth if needed
        }
        return Promise.reject(error);
    }
);

export default apiClient;