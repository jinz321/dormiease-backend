/**
 * Environment configuration for the mobile app
 * 
 * INSTRUCTIONS:
 * 1. To use your Render backend, set USE_RENDER = true
 * 2. Replace 'YOUR-RENDER-APP-NAME' with your actual Render app URL
 * 3. To use local backend, set USE_RENDER = false and update LOCAL_IP if needed
 */

// ⚙️ CONFIGURATION - Change this to switch between local and Render
const USE_RENDER = false; // Set to true to use Render, false for local development

// 🌐 RENDER BACKEND URL - Replace with your actual Render URL
const RENDER_URL = 'https://dormiease-backend.onrender.com/api';

// 🏠 LOCAL BACKEND - Update this IP if your computer's IP changes
const LOCAL_IP = '192.168.100.33'; // Your local network IP
const LOCAL_URL = `http://${LOCAL_IP}:3000/api`;

const ENV = {
    dev: {
        apiUrl: USE_RENDER ? RENDER_URL : LOCAL_URL,
        environment: 'development',
    },
    staging: {
        apiUrl: 'https://dormiease-staging.onrender.com/api',
        environment: 'staging',
    },
    prod: {
        apiUrl: 'https://dormiease-backend.onrender.com/api',
        environment: 'production',
    },
};

/**
 * Get environment variables based on current mode
 * @returns Environment configuration object
 */
const getEnvVars = () => {
    // __DEV__ is true when running in development mode
    if (__DEV__) {
        return ENV.dev;
    }

    // In production, use prod environment
    return ENV.prod;
};

const config = getEnvVars();

// Export individual values for convenience
export const API_URL = config.apiUrl;
export const BASE_URL = config.apiUrl.replace('/api', '');
export const ENVIRONMENT = config.environment;

export default config;
