/**
 * Backend Connection Tester
 * 
 * This script helps you verify that your backend is reachable
 * Run this before starting the mobile app to ensure connectivity
 */

const axios = require('axios');

// Backend URLs
const RENDER_URL = 'https://dormiease-backend.onrender.com/api';
const BASE_URL = 'https://dormiease-backend.onrender.com';

console.log('🔍 Testing Backend Connection...\n');
console.log(`📡 API URL: ${RENDER_URL}`);
console.log(`🌐 Base URL: ${BASE_URL}\n`);

async function testConnection() {
    try {
        console.log('⏳ Attempting to connect...');

        // Test basic connectivity
        const response = await axios.get(BASE_URL, {
            timeout: 10000,
            validateStatus: () => true // Accept any status code
        });

        console.log(`✅ Connection successful!`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📝 Response:`, response.data || 'No data');

        // Test API endpoint
        console.log('\n⏳ Testing API endpoint...');
        try {
            const apiResponse = await axios.get(`${RENDER_URL}/health`, {
                timeout: 10000,
                validateStatus: () => true
            });
            console.log(`✅ API endpoint reachable!`);
            console.log(`📊 Status: ${apiResponse.status}`);
        } catch (apiError) {
            console.log(`⚠️  API health endpoint not found (this is okay if not implemented)`);
        }

        console.log('\n✨ Backend is ready! You can start the mobile app now.\n');

    } catch (error) {
        console.log('\n❌ Connection failed!');
        console.log(`📝 Error: ${error.message}\n`);

        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Troubleshooting:');
            console.log('   1. Check if your backend is running');
            console.log('   2. Verify the URL in config.ts is correct');
            console.log('   3. If using Render, visit the URL in a browser to wake it up\n');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 Troubleshooting:');
            console.log('   1. Your backend might be sleeping (Render free tier)');
            console.log('   2. Visit the URL in a browser and wait 30-60 seconds');
            console.log('   3. Then run this test again\n');
        } else if (error.code === 'ENOTFOUND') {
            console.log('💡 Troubleshooting:');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify the URL in config.ts is correct');
            console.log('   3. Make sure you replaced YOUR-RENDER-APP-NAME with actual URL\n');
        }

        process.exit(1);
    }
}

testConnection();
