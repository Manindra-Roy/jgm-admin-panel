/**
 * @fileoverview Global Axios API Configuration.
 * Creates a centralized Axios instance for the Admin Panel to communicate with the backend.
 * Handles base URLs, HTTP-Only cookie credentials, and global error interception (like expired sessions).
 */

import axios from 'axios';

/**
 * Centralized Axios instance.
 * Automatically attaches the `jgm_token` cookie to every request via `withCredentials: true`.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Global Response Interceptor.
 * Listens to every response coming back from the backend.
 * If the backend returns a 401 (Unauthorized) or 403 (Forbidden), it means the Admin JWT expired or is invalid.
 * It immediately clears the local auth state and kicks the user back to the login page.
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            
            // Clear local authentication flags
            localStorage.removeItem('is_authenticated');
            
            // Redirect to login page (only if not already there to prevent infinite loops)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;