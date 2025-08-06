// Script to test Marathon course creation and capture error
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Sherwin's credentials
const CREDENTIALS = {
  email: 'sherwin.alegre@example.com',
  password: 'Password123!'
};

// Simple HTTP request with detailed error capture
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = data ? JSON.parse(data) : {};
            resolve(result);
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        } else {
          // Return full error details
          reject({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            body: data,
            message: `HTTP ${res.statusCode}: ${data}`
          });
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

// Marathon course from the failing script
const MARATHON_COURSE = {
  title: "Full-Stack Web Development Marathon TEST",
  description: "Comprehensive 6-month journey to become a full-stack web developer.",
  shortDescription: "6-month full-stack program",
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
  paymentPlanDetailsJson: JSON.stringify({
    numberOfPayments: 6,
    paymentAmount: 1499.83,
    frequency: "Monthly"
  }),
  hasCertificate: true,
  hasCommunity: true,
  hasLiveSessions: true,
  hasDownloadableResources: true,
  hasAssignments: true,
  hasQuizzes: true,
  dripContent: true,
  dripScheduleJson: JSON.stringify({
    type: "sequential",
    delayDays: 7
  }),
  automationWelcomeEmail: true,
  automationCompletionCertificate: true,
  automationProgressReminders: true,
  automationAbandonmentSequence: false,
  modules: [{
    title: "Week 1: Web Fundamentals",
    description: "HTML and CSS basics",
    order: 1,
    lessons: [{ title: "Kickoff", type: "Live", duration: "90:00", order: 1 }]
  }]
};

async function testMarathonError() {
  console.log('🔍 Testing Marathon Course Error\n');
  
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
    
    // Create Marathon course
    console.log('📘 Creating Marathon course...');
    console.log('Request body:', JSON.stringify(MARATHON_COURSE, null, 2), '\n');
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(MARATHON_COURSE)
      });
      
      console.log('✅ Marathon course created successfully!');
      console.log('Response:', JSON.stringify(response, null, 2));
      
    } catch (error) {
      console.log('❌ Marathon course failed!');
      console.log('Status Code:', error.statusCode);
      console.log('Status Message:', error.statusMessage);
      console.log('Response Headers:', JSON.stringify(error.headers, null, 2));
      console.log('Response Body:', error.body);
      console.log('\nFull error details:', JSON.stringify(error, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message || error}`);
  }
}

// Run the test
testMarathonError();