// Quick Test Script - Tests course creation with minimal setup
// This script can be run immediately without npm install

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = 'http://localhost:5295/api';
const TEST_EMAIL = 'sherwin.alegre@test.com'; // Update if needed
const TEST_PASSWORD = 'Test123!'; // Update if needed

// Simple HTTP request function (no external dependencies)
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
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
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
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

// Test course data - one of each type
const TEST_COURSES = [
  {
    type: 'SPRINT',
    data: {
      title: `Sprint Test ${Date.now()}`,
      description: "Quick test of sprint course creation with GHL features",
      price: 999,
      level: "Beginner",
      category: "Programming",
      courseType: "Sprint",
      pricingModel: "one-time",
      currency: "PHP",
      accessType: "lifetime",
      courseFeatures: {
        certificate: true,
        community: false,
        liveSessions: false,
        downloadableResources: true,
        assignments: false,
        quizzes: true
      }
    }
  },
  {
    type: 'MARATHON',
    data: {
      title: `Marathon Test ${Date.now()}`,
      description: "Testing marathon course with payment plan",
      price: 4999,
      level: "Intermediate",
      category: "Programming",
      courseType: "Marathon",
      pricingModel: "payment-plan",
      paymentPlanDetails: {
        numberOfPayments: 3,
        paymentAmount: 1666.33,
        frequency: "monthly"
      },
      currency: "PHP",
      accessType: "lifetime",
      dripContent: true,
      dripSchedule: {
        type: "sequential",
        delayDays: 7
      }
    }
  },
  {
    type: 'MEMBERSHIP',
    data: {
      title: `Membership Test ${Date.now()}`,
      description: "Testing membership/subscription course type",
      price: 1999,
      level: "AllLevels",
      category: "Business",
      courseType: "Membership",
      pricingModel: "subscription",
      subscriptionPeriod: "monthly",
      currency: "PHP",
      accessType: "limited",
      accessDuration: 30,
      courseFeatures: {
        certificate: false,
        community: true,
        liveSessions: true,
        downloadableResources: true,
        assignments: false,
        quizzes: false
      }
    }
  },
  {
    type: 'CUSTOM',
    data: {
      title: `Custom Free Test ${Date.now()}`,
      description: "Testing custom course type with free pricing",
      price: 0,
      level: "Beginner",
      category: "Design",
      courseType: "Custom",
      pricingModel: "free",
      currency: "PHP",
      accessType: "lifetime",
      enrollmentLimit: 100,
      automations: {
        welcomeEmail: true,
        completionCertificate: true,
        progressReminders: false,
        abandonmentSequence: false
      }
    }
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Main test function
async function runQuickTest() {
  console.log(`${colors.blue}🚀 Quick Course Creation Test${colors.reset}\n`);
  console.log(`${colors.gray}Testing API: ${API_BASE_URL}${colors.reset}`);
  console.log(`${colors.gray}Test User: ${TEST_EMAIL}${colors.reset}\n`);
  
  let authToken;
  const results = [];
  
  try {
    // Step 1: Login
    console.log(`${colors.yellow}📝 Logging in...${colors.reset}`);
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    authToken = loginResponse.token;
    console.log(`${colors.green}✅ Login successful!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Login failed: ${error.message}${colors.reset}`);
    console.log('\nPlease check:');
    console.log('1. Backend API is running on port 5295');
    console.log('2. Test user credentials are correct');
    console.log('3. Test user has Creator/Instructor role');
    return;
  }
  
  // Step 2: Test each course type
  console.log(`${colors.yellow}📚 Testing Course Types${colors.reset}`);
  console.log('=======================\n');
  
  for (const test of TEST_COURSES) {
    process.stdout.write(`${test.type} Course: `);
    
    try {
      const startTime = Date.now();
      
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(test.data)
      });
      
      const elapsed = Date.now() - startTime;
      
      console.log(`${colors.green}✅ Created${colors.reset} (ID: ${response.id}, ${elapsed}ms)`);
      
      results.push({
        type: test.type,
        status: 'PASS',
        courseId: response.id,
        title: test.data.title,
        time: elapsed
      });
      
    } catch (error) {
      console.log(`${colors.red}❌ Failed${colors.reset} - ${error.message}`);
      
      results.push({
        type: test.type,
        status: 'FAIL',
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Step 3: Summary
  console.log(`\n${colors.yellow}📊 Test Summary${colors.reset}`);
  console.log('===============\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const successRate = (passed / results.length * 100).toFixed(0);
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${successRate}%\n`);
  
  // Detailed results
  console.log('Details:');
  console.log('--------');
  results.forEach(r => {
    if (r.status === 'PASS') {
      console.log(`${colors.green}✅ ${r.type}${colors.reset}`);
      console.log(`   ID: ${r.courseId}`);
      console.log(`   Title: ${r.title}`);
      console.log(`   Time: ${r.time}ms`);
    } else {
      console.log(`${colors.red}❌ ${r.type}${colors.reset}`);
      console.log(`   Error: ${r.error}`);
    }
    console.log();
  });
  
  // Step 4: Verification instructions
  if (passed > 0) {
    console.log(`${colors.blue}📝 Verification Steps:${colors.reset}`);
    console.log('1. Log in as admin or the test creator');
    console.log('2. Navigate to course management');
    console.log('3. Check for the following courses:');
    results.filter(r => r.status === 'PASS').forEach(r => {
      console.log(`   - "${r.title}" (${r.type})`);
    });
    console.log('\n4. Verify course types and features match expectations');
  }
  
  console.log(`\n${colors.green}✨ Test complete!${colors.reset}`);
}

// Run the test
console.clear();
runQuickTest().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});