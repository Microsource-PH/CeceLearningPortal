// Script to create a single course for debugging
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

// Marathon course with payment plan
const MARATHON_COURSE = {
  title: "Full-Stack Web Development Marathon - Drip Content Test",
  description: "Embark on a comprehensive 6-month journey to become a full-stack web developer.",
  shortDescription: "6-month intensive full-stack development program",
  category: "Programming",
  level: "Beginner",
  language: "en",
  duration: "6 months",
  thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
  
  // GHL specific
  courseType: "Marathon",
  pricingModel: "PaymentPlan", // Test payment plan
  price: 8999,
  currency: "PHP",
  accessType: "Lifetime",
  
  // Payment plan details as JSON string
  paymentPlanDetailsJson: JSON.stringify({
    numberOfPayments: 6,
    paymentAmount: 1499.83,
    frequency: "Monthly"
  }),
  
  // Drip content
  dripContent: true,
  dripScheduleJson: JSON.stringify({
    type: "sequential",
    delayDays: 7
  }),
  
  // Features
  hasCertificate: true,
  hasCommunity: true,
  hasLiveSessions: true,
  hasDownloadableResources: true,
  hasAssignments: true,
  hasQuizzes: true,
  
  // Automation
  automationWelcomeEmail: true,
  automationCompletionCertificate: true,
  automationProgressReminders: true,
  automationAbandonmentSequence: false,
  
  // Simple content
  modules: [
    {
      title: "Week 1: Web Fundamentals",
      description: "Master HTML5 and CSS3",
      order: 1,
      lessons: [
        { title: "Welcome", type: "Video", duration: "10:00", order: 1 }
      ]
    }
  ]
};

async function createSingleCourse() {
  console.log('🔄 Creating Single Marathon Course\n');
  
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
    
    // Create course
    console.log('📘 Creating Marathon course...');
    console.log('Sending data:', JSON.stringify(MARATHON_COURSE, null, 2));
    
    const response = await makeRequest(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(MARATHON_COURSE)
    });
    
    console.log('✅ Created successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('Full error:', error);
  }
}

// Run the script
createSingleCourse();