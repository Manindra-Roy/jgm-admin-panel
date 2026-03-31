// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true, // Sends the HttpOnly cookie
});

// GLOBAL SECURITY INTERCEPTOR
api.interceptors.response.use(
    (response) => {
        // If the request succeeds, just pass it through normally
        return response;
    },
    (error) => {
        // If the backend rejects the cookie (expired or invalid)
        if (error.response && error.response.status === 401) {
            console.error("Session expired. Redirecting to login.");
            localStorage.removeItem('is_authenticated');
            // Forcefully redirect to the login screen
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;