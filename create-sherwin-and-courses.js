// Script to create Sherwin Alegre account and courses
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Sherwin's account details
const SHERWIN_ACCOUNT = {
  fullName: 'Sherwin Alegre',
  email: 'sherwin.alegre@example.com',
  password: 'Password123!',
  role: 'Creator'
};

// Simple HTTP request function
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
          resolve({ statusCode: res.statusCode, body: data });
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

// Sherwin's courses
const SHERWIN_COURSES = [
  {
    type: 'SPRINT',
    data: {
      title: "Sherwin's Sprint: Quick PHP Mastery",
      description: "Learn PHP fundamentals in just 7 days with Sherwin Alegre. This intensive sprint course covers everything you need to start building PHP applications.",
      shortDescription: "Master PHP basics in 7 days",
      price: 1299,
      duration: "7 days",
      level: "Beginner",
      category: "Programming",
      courseType: "Sprint",
      pricingModel: "OneTime",
      currency: "PHP",
      language: "en",
      accessType: "Lifetime",
      thumbnailUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=400",
      hasCertificate: true,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true
    }
  },
  {
    type: 'MARATHON', 
    data: {
      title: "Sherwin's Full-Stack Web Development Marathon",
      description: "Join Sherwin Alegre on a comprehensive 6-month journey to become a full-stack developer. From HTML/CSS basics to advanced PHP, MySQL, and modern JavaScript frameworks.",
      shortDescription: "Complete full-stack development program",
      price: 5999,
      duration: "6 months",
      level: "Beginner",
      category: "Programming",
      courseType: "Marathon",
      pricingModel: "PaymentPlan",
      numberOfPayments: 6,
      paymentAmount: 999.83,
      paymentFrequency: "Monthly",
      currency: "PHP",
      language: "en",
      accessType: "Lifetime",
      thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400",
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
      })
    }
  },
  {
    type: 'MEMBERSHIP',
    data: {
      title: "Sherwin's Coding Academy Membership",
      description: "Get unlimited access to all of Sherwin Alegre's programming courses. New content added monthly, weekly live Q&A sessions, and exclusive access to our private developer community.",
      shortDescription: "All-access pass to Sherwin's courses",
      price: 2499,
      duration: "Ongoing",
      level: "AllLevels",
      category: "Programming",
      courseType: "Membership",
      pricingModel: "Subscription",
      subscriptionPeriod: "Monthly",
      currency: "PHP",
      language: "en",
      accessType: "Limited",
      accessDuration: 30,
      thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
      enrollmentLimit: 500,
      hasCertificate: true,
      hasCommunity: true,
      hasLiveSessions: true,
      hasDownloadableResources: true
    }
  },
  {
    type: 'CUSTOM',
    data: {
      title: "Sherwin's Free Introduction to Programming",
      description: "Sherwin Alegre shares his passion for programming in this free introductory course. Perfect for absolute beginners who want to explore if coding is right for them.",
      shortDescription: "Free intro to programming",
      price: 0,
      duration: "Self-paced",
      level: "Beginner",
      category: "Programming",
      courseType: "Custom",
      pricingModel: "Free",
      currency: "PHP",
      language: "en",
      accessType: "Lifetime",
      enrollmentLimit: 1000,
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
      hasCertificate: true,
      hasCommunity: true,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true
    }
  }
];

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function createSherwinAccount() {
  console.log(`${colors.blue}🚀 Creating Sherwin Alegre's Account & Courses${colors.reset}\n`);
  
  // Step 1: Try to create account
  console.log(`${colors.yellow}📝 Step 1: Creating Sherwin's account...${colors.reset}`);
  
  try {
    const signupResponse = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        fullName: SHERWIN_ACCOUNT.fullName,
        email: SHERWIN_ACCOUNT.email,
        password: SHERWIN_ACCOUNT.password,
        confirmPassword: SHERWIN_ACCOUNT.password,
        role: SHERWIN_ACCOUNT.role
      })
    });
    
    console.log(`${colors.green}✅ Account created successfully!${colors.reset}`);
    console.log(`   Please approve the account in admin panel before continuing.\n`);
    
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`${colors.yellow}⚠️  Account already exists${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Failed to create account: ${error.message}${colors.reset}`);
    }
  }
  
  // Step 2: Try to login
  console.log(`\n${colors.yellow}📝 Step 2: Attempting to login...${colors.reset}`);
  
  let authToken = null;
  
  try {
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST', 
      body: JSON.stringify({
        email: SHERWIN_ACCOUNT.email,
        password: SHERWIN_ACCOUNT.password
      })
    });
    
    if (loginResponse.token) {
      authToken = loginResponse.token;
      console.log(`${colors.green}✅ Login successful!${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Login failed: ${error.message}${colors.reset}`);
    console.log('\nPlease ensure:');
    console.log('1. The account has been approved by admin');
    console.log('2. The backend API is running on port 5295');
    console.log('\nTo approve the account:');
    console.log('1. Login as admin at http://localhost:8081');
    console.log('2. Go to Users & Subscriptions');
    console.log('3. Find Sherwin Alegre in Pending Approval');
    console.log('4. Click Approve');
    return;
  }
  
  // Step 3: Create courses
  console.log(`${colors.cyan}📚 Step 3: Creating Sherwin's Courses${colors.reset}`);
  console.log('====================================\n');
  
  const results = [];
  
  for (const course of SHERWIN_COURSES) {
    console.log(`${colors.yellow}Creating ${course.type} Course:${colors.reset}`);
    console.log(`Title: "${course.data.title}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await makeRequest(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(course.data)
      });
      
      const elapsed = Date.now() - startTime;
      
      console.log(`${colors.green}✅ Created successfully!${colors.reset}`);
      console.log(`   Course ID: ${response.id}`);
      console.log(`   Status: ${response.status || 'Draft'}`);
      console.log(`   Time: ${elapsed}ms\n`);
      
      results.push({
        type: course.type,
        status: 'SUCCESS',
        id: response.id,
        title: course.data.title
      });
      
    } catch (error) {
      console.log(`${colors.red}❌ Failed to create${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      
      results.push({
        type: course.type,
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
  console.log('===========\n');
  
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`Total Courses: ${results.length}`);
  console.log(`${colors.green}✅ Created: ${successful}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}\n`);
  
  if (successful > 0) {
    console.log(`${colors.green}🎉 Sherwin Alegre's courses are now live!${colors.reset}\n`);
    console.log('Created courses:');
    results.filter(r => r.status === 'SUCCESS').forEach(r => {
      console.log(`  • ${r.title} (ID: ${r.id})`);
    });
    
    console.log(`\n${colors.blue}📱 Next Steps:${colors.reset}`);
    console.log('1. Login as Sherwin Alegre at http://localhost:8081');
    console.log('2. Go to "My Courses" to see all created courses');
    console.log('3. Click on any course to edit or publish it');
    console.log('4. Students can enroll once courses are published');
  }
  
  console.log(`\n${colors.green}✨ Done!${colors.reset}`);
}

// Run the script
console.clear();
createSherwinAccount().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
});