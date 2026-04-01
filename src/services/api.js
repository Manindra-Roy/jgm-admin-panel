// src/services/api.js
import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
    // Replace with your actual backend URL in production
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    
    // CRITICAL: This allows Axios to send and receive HttpOnly cookies!
    withCredentials: true, 
    
    headers: {
        'Content-Type': 'application/json'
    }
});

// Global Response Interceptor
api.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        
        // Check if the error is due to an expired or missing authentication token
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            
            // Clear local flags
            localStorage.removeItem('is_authenticated');
            
            // Redirect to login page (only if not already there to prevent loops)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;