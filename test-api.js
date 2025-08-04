/**
 * Test script for the Dawid Faith Webhook API
 * Usage: node test-api.js [API_URL]
 */

const axios = require('axios');

const API_URL = process.argv[2] || 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSwapEndpoint() {
  console.log('🔍 Testing swap endpoint...');
  try {
    const swapData = {
      ethAmount: "0.001", // Small test amount
      slippage: 200 // 2% slippage for testing
    };
    
    console.log('📝 Sending swap request:', swapData);
    const response = await axios.post(`${API_URL}/api/swap`, swapData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Swap test passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Swap test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidRequest() {
  console.log('🔍 Testing invalid request handling...');
  try {
    const invalidData = {
      ethAmount: "invalid"
    };
    
    const response = await axios.post(`${API_URL}/api/swap`, invalidData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('❌ Should have failed but passed:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid request properly rejected:', error.response.data);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log(`🚀 Testing Dawid Faith Webhook API at: ${API_URL}\n`);
  
  const results = await Promise.allSettled([
    testHealthEndpoint(),
    testInvalidRequest(),
    // Uncomment next line to test actual swap (requires ETH in wallet)
    // testSwapEndpoint()
  ]);
  
  const passed = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
