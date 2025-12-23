import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../config';

/**
 * Configured axios instance with interceptors for error handling
 */
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle different error scenarios
        let errorMessage = 'Something went wrong';

        if (error.response) {
            // Server responded with error status
            errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        } else if (error.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.';
        } else {
            // Something else happened
            errorMessage = error.message;
        }

        // Show user-friendly error alert
        Alert.alert('Error', errorMessage);

        return Promise.reject(error);
    }
);

export default apiClient;
