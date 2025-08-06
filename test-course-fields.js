// Script to test which fields are causing issues
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

// Test different course types
const TEST_MEMBERSHIP = {
  title: "Test Membership Course",
  description: "Test description",
  shortDescription: "Test short description",
  category: "Programming",
  level: "AllLevels",
  language: "en",
  duration: "Ongoing",
  thumbnailUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=800&h=450&fit=crop",
  
  // GHL specific
  courseType: "Membership",
  pricingModel: "Subscription",
  price: 2499,
  currency: "PHP",
  subscriptionPeriod: "Monthly",
  accessType: "Limited",
  accessDuration: 30,
  
  // Features
  hasCertificate: true,
  hasCommunity: false,
  hasLiveSessions: false,
  hasDownloadableResources: true,
  hasAssignments: true,
  hasQuizzes: true,
  
  // Automation
  automationWelcomeEmail: true,
  automationCompletionCertificate: true,
  automationProgressReminders: true,
  automationAbandonmentSequence: true,
  
  // Content
  modules: [{
    title: "Module 1",
    description: "Test module",
    order: 1,
    lessons: [{ title: "Lesson 1", type: "Video", duration: "10:00", order: 1 }]
  }]
};

// Test fields one by one
const TEST_FIELDS = [
  { name: "objectives", value: ["Objective 1", "Objective 2"] },
  { name: "prerequisites", value: ["Prerequisite 1"] },
  { name: "targetAudience", value: ["Audience 1"] },
  { name: "enrollmentLimit", value: 500 },
  { name: "accessDuration", value: 30 },
];

async function testFields() {
  console.log('🔧 Testing Course Field Compatibility\n');
  
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
    
    // Test Membership course
    console.log('📘 Testing Membership course...');
    try {
      const membershipResponse = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(TEST_MEMBERSHIP)
      });
      console.log('✅ Membership course created successfully (ID: ' + membershipResponse.id + ')\n');
      
      // Delete it
      await makeRequest(`${API_BASE_URL}/courses/${membershipResponse.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('❌ Membership course failed: ' + error.message);
      console.log('Request body:', JSON.stringify(TEST_MEMBERSHIP, null, 2) + '\n');
      return;
    }
    
    // Test each field individually
    for (const field of TEST_FIELDS) {
      console.log(`🔍 Testing field: ${field.name}`);
      
      const testCourse = {
        ...WORKING_SPRINT,
        title: `Test Course with ${field.name}`,
        [field.name]: field.value
      };
      
      try {
        const response = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(testCourse)
        });
        
        console.log(`   ✅ Field ${field.name} works! (Course ID: ${response.id})`);
        
        // Delete test course
        await makeRequest(`${API_BASE_URL}/courses/${response.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
      } catch (error) {
        console.log(`   ❌ Field ${field.name} causes error: ${error.message}`);
      }
      console.log('');
    }
    
    console.log('✨ Field testing complete!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the test
testFields();