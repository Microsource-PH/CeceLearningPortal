// Script to test Marathon course creation step by step
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
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || data || 'Unknown error'}`));
          }
        } catch (e) {
          if (res.statusCode === 204) {
            resolve({ success: true });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
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

// Start with basic Marathon course
let MARATHON_COURSE = {
  title: "Test Marathon Course",
  description: "Test description",
  shortDescription: "Test short description",
  category: "Programming",
  level: "Beginner",
  language: "en",
  duration: "6 months",
  thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
  courseType: "Marathon",
  pricingModel: "OneTime", // Start simple
  price: 8999,
  currency: "PHP",
  accessType: "Lifetime",
  hasCertificate: true,
  hasCommunity: true,
  hasLiveSessions: true,
  hasDownloadableResources: true,
  hasAssignments: true,
  hasQuizzes: true,
  automationWelcomeEmail: true,
  automationCompletionCertificate: true,
  automationProgressReminders: true,
  automationAbandonmentSequence: false,
  modules: [{
    title: "Week 1",
    description: "Test",
    order: 1,
    lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
  }]
};

async function testMarathon() {
  console.log('🧪 Testing Marathon Course Creation\n');
  
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
    
    // Test 1: Basic Marathon course
    console.log('Test 1: Basic Marathon course with OneTime pricing');
    try {
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(MARATHON_COURSE)
      });
      console.log('✅ Basic Marathon course works! (ID: ' + response.id + ')');
      
      // Delete it
      await makeRequest(`${API_BASE_URL}/courses/${response.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('❌ Basic Marathon course failed: ' + error.message);
      return;
    }
    
    // Test 2: Add PaymentPlan
    console.log('\nTest 2: Marathon course with PaymentPlan pricing');
    MARATHON_COURSE.title = "Test Marathon with Payment Plan";
    MARATHON_COURSE.pricingModel = "PaymentPlan";
    MARATHON_COURSE.paymentPlanDetailsJson = JSON.stringify({
      numberOfPayments: 6,
      paymentAmount: 1499.83,
      frequency: "Monthly"
    });
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(MARATHON_COURSE)
      });
      console.log('✅ Marathon with PaymentPlan works! (ID: ' + response.id + ')');
      
      // Delete it
      await makeRequest(`${API_BASE_URL}/courses/${response.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('❌ Marathon with PaymentPlan failed: ' + error.message);
      console.log('Request body:', JSON.stringify(MARATHON_COURSE, null, 2));
      return;
    }
    
    // Test 3: Add drip content
    console.log('\nTest 3: Marathon course with drip content');
    MARATHON_COURSE.title = "Test Marathon with Drip";
    MARATHON_COURSE.dripContent = true;
    MARATHON_COURSE.dripScheduleJson = JSON.stringify({
      type: "sequential",
      delayDays: 7
    });
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(MARATHON_COURSE)
      });
      console.log('✅ Marathon with drip content works! (ID: ' + response.id + ')');
      
      // Delete it
      await makeRequest(`${API_BASE_URL}/courses/${response.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('❌ Marathon with drip content failed: ' + error.message);
    }
    
    console.log('\n✨ Marathon course testing complete!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the test
testMarathon();