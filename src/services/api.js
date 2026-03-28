// src/services/api.js
import axios from 'axios';

// Point this to your local Node.js server
const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
});

// Request Interceptor: Attach the JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jgm_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;