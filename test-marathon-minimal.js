// Test Marathon course with minimal fields
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Sherwin's credentials
const CREDENTIALS = {
  email: 'sherwin.alegre@example.com',
  password: 'Password123!'
};

// Simple HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || JSON.stringify(result)}`));
          }
        } catch (e) {
          if (res.statusCode === 204) {
            resolve({ success: true });
          } else {
            resolve({ statusCode: res.statusCode, body: data });
          }
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testMarathon() {
  console.log('🧪 Testing Marathon Course Variations\n');
  
  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS)
    });
    
    const authToken = loginResponse.accessToken;
    if (!authToken) {
      throw new Error('No auth token received');
    }
    console.log('✅ Login successful\n');
    
    // Test 1: Marathon without payment plan
    console.log('Test 1: Marathon without payment plan (OneTime pricing)');
    try {
      const response1 = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: "Marathon Test 1 - OneTime",
          description: "Test description",
          shortDescription: "Test",
          category: "Programming",
          level: "Beginner",
          language: "en",
          duration: "6 months",
          thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
          courseType: "Marathon",
          pricingModel: "OneTime", // NO payment plan
          price: 8999,
          currency: "PHP",
          accessType: "Lifetime",
          courseFeatures: {
            certificate: true,
            community: true,
            liveSessions: true,
            downloadableResources: true,
            assignments: true,
            quizzes: true
          },
          automations: {
            welcomeEmail: true,
            completionCertificate: true,
            progressReminders: true,
            abandonmentSequence: false
          },
          modules: [{
            title: "Week 1",
            description: "Test",
            order: 1,
            lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
          }]
        })
      });
      console.log('✅ Success! (ID: ' + response1.id + ')');
      await makeRequest(`${API_BASE_URL}/courses/${response1.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
    
    // Test 2: Marathon with payment plan
    console.log('\nTest 2: Marathon with payment plan');
    try {
      const response2 = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: "Marathon Test 2 - PaymentPlan",
          description: "Test description",
          shortDescription: "Test",
          category: "Programming",
          level: "Beginner",
          language: "en",
          duration: "6 months",
          thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
          courseType: "Marathon",
          pricingModel: "PaymentPlan",
          price: 8999,
          currency: "PHP",
          accessType: "Lifetime",
          paymentPlanDetails: {
            numberOfPayments: 6,
            paymentAmount: 1499.83,
            frequency: "Monthly"
          },
          courseFeatures: {
            certificate: true,
            community: true,
            liveSessions: true,
            downloadableResources: true,
            assignments: true,
            quizzes: true
          },
          automations: {
            welcomeEmail: true,
            completionCertificate: true,
            progressReminders: true,
            abandonmentSequence: false
          },
          modules: [{
            title: "Week 1",
            description: "Test",
            order: 1,
            lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
          }]
        })
      });
      console.log('✅ Success! (ID: ' + response2.id + ')');
      await makeRequest(`${API_BASE_URL}/courses/${response2.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
    
    // Test 3: Marathon with drip content
    console.log('\nTest 3: Marathon with drip content');
    try {
      const response3 = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: "Marathon Test 3 - Drip",
          description: "Test description",
          shortDescription: "Test",
          category: "Programming",
          level: "Beginner",
          language: "en",
          duration: "6 months",
          thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
          courseType: "Marathon",
          pricingModel: "OneTime",
          price: 8999,
          currency: "PHP",
          accessType: "Lifetime",
          courseFeatures: {
            certificate: true,
            community: true,
            liveSessions: true,
            downloadableResources: true,
            assignments: true,
            quizzes: true
          },
          dripContent: true,
          dripSchedule: {
            type: "sequential",
            delayDays: 7
          },
          automations: {
            welcomeEmail: true,
            completionCertificate: true,
            progressReminders: true,
            abandonmentSequence: false
          },
          modules: [{
            title: "Week 1",
            description: "Test",
            order: 1,
            lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
          }]
        })
      });
      console.log('✅ Success! (ID: ' + response3.id + ')');
      await makeRequest(`${API_BASE_URL}/courses/${response3.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
    
    // Test 4: Marathon with payment plan AND drip (like the failing one)
    console.log('\nTest 4: Marathon with payment plan AND drip content');
    try {
      const response4 = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          title: "Marathon Test 4 - Both",
          description: "Test description",
          shortDescription: "Test",
          category: "Programming",
          level: "Beginner",
          language: "en",
          duration: "6 months",
          thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
          courseType: "Marathon",
          pricingModel: "PaymentPlan",
          price: 8999,
          currency: "PHP",
          accessType: "Lifetime",
          paymentPlanDetails: {
            numberOfPayments: 6,
            paymentAmount: 1499.83,
            frequency: "Monthly"
          },
          courseFeatures: {
            certificate: true,
            community: true,
            liveSessions: true,
            downloadableResources: true,
            assignments: true,
            quizzes: true
          },
          dripContent: true,
          dripSchedule: {
            type: "sequential",
            delayDays: 7
          },
          automations: {
            welcomeEmail: true,
            completionCertificate: true,
            progressReminders: true,
            abandonmentSequence: false
          },
          modules: [{
            title: "Week 1",
            description: "Test",
            order: 1,
            lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
          }]
        })
      });
      console.log('✅ Success! (ID: ' + response4.id + ')');
      await makeRequest(`${API_BASE_URL}/courses/${response4.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
    
    console.log('\n✨ Testing complete!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the test
testMarathon();