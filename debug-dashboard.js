// Simple test script to check dashboard API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    console.log(`   URL: ${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Dashboard API Tests...');
  
  // Test basic health check
  await testEndpoint('/health', 'Health Check');
  
  // Test dashboard endpoints (these will fail without auth, but we can see the error)
  await testEndpoint('/api/dashboard/metrics', 'Dashboard Metrics');
  await testEndpoint('/api/dashboard/activities', 'Dashboard Activities');
  
  // Test stats endpoints
  await testEndpoint('/api/donations/stats/overview', 'Donations Stats');
  await testEndpoint('/api/alumni/stats/overview', 'Alumni Stats');
  await testEndpoint('/api/events/stats/overview', 'Events Stats');
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);