// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true, // IMPORTANT: This tells Axios to send the HttpOnly cookie!
});

export default api;