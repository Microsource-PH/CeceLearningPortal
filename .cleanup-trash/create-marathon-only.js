// Script to create ONLY the Marathon course
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

// EXACT Marathon course from the failing script
const MARATHON_COURSE = {
  title: "Full-Stack Web Development Marathon",
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
    title: "Week 1: Web Fundamentals",
    description: "HTML and CSS basics",
    order: 1,
    lessons: [
      { title: "Kickoff", type: "Video", duration: "90:00", order: 1 },
      { title: "HTML5 Essentials", type: "Video", duration: "45:00", order: 2 }
    ]
  }]
};

async function createMarathonOnly() {
  console.log('🎯 Creating ONLY Marathon Course\n');
  
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
    console.log('Request data:', JSON.stringify(MARATHON_COURSE, null, 2), '\n');
    
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
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the script
createMarathonOnly();