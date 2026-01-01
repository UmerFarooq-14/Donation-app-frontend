import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
    baseURL:"https://donation-app-backend-l2p1.onrender.com",
    timeout:10000,
    headers:{
        "Content-Type":"application/json"
    }
})

// Request interceptor to add JWT token from Zustand
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use((res) => {
    return res;
}, (error) => {
    // Handle 401 unauthorized - logout user
    if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        // Redirect to login will be handled by ProtectedRoute
    }
    return Promise.reject(error);
})  

export default apiClient