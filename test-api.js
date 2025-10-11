/**
 * Simple API test script to verify the backend is working
 * Run with: node test-api.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing NeuroFi API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data.status);
    console.log('   MongoDB:', health.data.mongodb);
    console.log('   Services:', health.data.services);

    // Test market overview
    console.log('\n2. Testing market overview...');
    const market = await axios.get(`${API_BASE}/api/market/overview`);
    console.log('✅ Market data loaded:', market.data.data.length, 'cryptocurrencies');
    console.log('   Message:', market.data.message || 'Using live data');

    // Test registration
    console.log('\n3. Testing user registration...');
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const register = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    console.log('✅ User registration successful');
    console.log('   User ID:', register.data.user.id);
    console.log('   Token received:', !!register.data.token);

    // Test login
    console.log('\n4. Testing user login...');
    const login = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful');
    console.log('   Welcome:', login.data.user.firstName, login.data.user.lastName);

    console.log('\n🎉 All API tests passed! NeuroFi backend is working correctly.');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
    console.log('   Run: cd backend/api && npm run dev');
  }
}

// Run the test
testAPI();