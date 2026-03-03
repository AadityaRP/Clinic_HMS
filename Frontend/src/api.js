import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
});

console.log('🚀 Senti AI API Base URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('hms_token');
            localStorage.removeItem('hms_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
