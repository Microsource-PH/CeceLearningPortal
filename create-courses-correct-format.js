// Script to create Sherwin's courses with correct DTO format
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

// Courses with correct DTO format
const COURSES = [
  {
    // SPRINT COURSE
    title: "PHP Mastery Sprint: 7-Day Intensive",
    description: "Master PHP fundamentals in just 7 days with this intensive sprint course.",
    shortDescription: "Intensive 7-day PHP bootcamp",
    category: "Programming",
    level: "Beginner",
    language: "en",
    duration: "7 days",
    thumbnailUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=800&h=450&fit=crop",
    courseType: "Sprint",
    pricingModel: "OneTime",
    price: 1499,
    currency: "PHP",
    accessType: "Lifetime",
    courseFeatures: {
      certificate: true,
      community: false,
      liveSessions: false,
      downloadableResources: true,
      assignments: true,
      quizzes: true
    },
    automations: {
      welcomeEmail: true,
      completionCertificate: true,
      progressReminders: true,
      abandonmentSequence: true
    },
    modules: [{
      title: "Day 1: PHP Fundamentals",
      description: "Get started with PHP",
      order: 1,
      lessons: [
        { title: "Welcome", type: "Video", duration: "15:00", order: 1, isPreview: true },
        { title: "Your First PHP Script", type: "Video", duration: "25:00", order: 2 }
      ]
    }]
  },
  {
    // MARATHON COURSE
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
        { title: "Kickoff Session", type: "Video", duration: "90:00", order: 1 },
        { title: "HTML5 Essentials", type: "Video", duration: "45:00", order: 2 }
      ]
    }]
  },
  {
    // MEMBERSHIP COURSE
    title: "Sherwin's Coding Academy Membership",
    description: "Unlimited access to our programming courses and resources.",
    shortDescription: "All-access membership",
    category: "Programming",
    level: "AllLevels",
    language: "en",
    duration: "Ongoing",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop",
    courseType: "Membership",
    pricingModel: "Subscription",
    price: 2499,
    currency: "PHP",
    subscriptionPeriod: "Monthly",
    accessType: "Limited",
    accessDuration: 30,
    enrollmentLimit: 500,
    courseFeatures: {
      certificate: false,
      community: true,
      liveSessions: true,
      downloadableResources: true,
      assignments: false,
      quizzes: false
    },
    dripContent: true,
    dripSchedule: {
      type: "scheduled",
      delayDays: 0
    },
    automations: {
      welcomeEmail: true,
      completionCertificate: false,
      progressReminders: true,
      abandonmentSequence: true
    },
    modules: [{
      title: "Welcome to the Academy",
      description: "Get oriented",
      order: 1,
      lessons: [
        { title: "Welcome", type: "Video", duration: "10:00", order: 1, isPreview: true }
      ]
    }]
  },
  {
    // CUSTOM COURSE
    title: "Introduction to Programming Thinking",
    description: "Free introductory course for absolute beginners.",
    shortDescription: "Free intro to programming",
    category: "Programming",
    level: "Beginner",
    language: "en",
    duration: "Self-paced",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop",
    courseType: "Custom",
    pricingModel: "Free",
    price: 0,
    currency: "PHP",
    accessType: "Lifetime",
    enrollmentLimit: 1000,
    courseFeatures: {
      certificate: true,
      community: true,
      liveSessions: false,
      downloadableResources: true,
      assignments: true,
      quizzes: true
    },
    dripContent: false,
    automations: {
      welcomeEmail: true,
      completionCertificate: true,
      progressReminders: false,
      abandonmentSequence: false
    },
    modules: [{
      title: "Programming Fundamentals",
      description: "Core concepts",
      order: 1,
      lessons: [
        { title: "What is Programming?", type: "Video", duration: "25:00", order: 1, isPreview: true }
      ]
    }]
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

async function createSherwinCourses() {
  console.log(`${colors.blue}🚀 Creating Sherwin's GHL Courses (Correct Format)${colors.reset}\n`);
  
  try {
    // Login
    console.log(`${colors.yellow}🔐 Logging in...${colors.reset}`);
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS)
    });
    
    const authToken = loginResponse.accessToken;
    if (!authToken) {
      throw new Error('No auth token received');
    }
    console.log(`${colors.green}✅ Login successful${colors.reset}\n`);
    
    // Delete existing courses
    console.log(`${colors.yellow}🗑️  Cleaning up existing courses...${colors.reset}`);
    const coursesResponse = await makeRequest(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const existingCourses = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse.data || [];
    const sherwinCourses = existingCourses.filter(course => 
      course.instructorId === loginResponse.id ||
      course.instructorName === 'Sherwin Alegre'
    );
    
    for (const course of sherwinCourses) {
      try {
        await makeRequest(`${API_BASE_URL}/courses/${course.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        console.log(`   ${colors.gray}Deleted: ${course.title}${colors.reset}`);
      } catch (error) {
        // Ignore deletion errors
      }
    }
    console.log('');
    
    // Create courses
    console.log(`${colors.cyan}📚 Creating courses...${colors.reset}\n`);
    const results = [];
    
    for (const course of COURSES) {
      console.log(`${colors.blue}📘 Creating ${course.courseType} course: ${course.title}${colors.reset}`);
      
      try {
        const response = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(course)
        });
        
        console.log(`   ${colors.green}✅ Created successfully! (ID: ${response.id})${colors.reset}\n`);
        results.push({ type: course.courseType, title: course.title, success: true, id: response.id });
        
      } catch (error) {
        console.log(`   ${colors.red}❌ Failed: ${error.message}${colors.reset}\n`);
        results.push({ type: course.courseType, title: course.title, success: false, error: error.message });
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
    console.log('==========\n');
    
    const successful = results.filter(r => r.success).length;
    console.log(`${colors.green}✅ Successful: ${successful}/${results.length}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${results.length - successful}/${results.length}${colors.reset}\n`);
    
    if (successful > 0) {
      console.log('Created courses:');
      results.filter(r => r.success).forEach(r => {
        console.log(`  ${colors.green}•${colors.reset} ${r.type}: ${r.title} (ID: ${r.id})`);
      });
    }
    
    if (results.some(r => !r.success)) {
      console.log('\nFailed courses:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  ${colors.red}•${colors.reset} ${r.type}: ${r.error}`);
      });
    }
    
    console.log(`\n${colors.blue}📱 Next Steps:${colors.reset}`);
    console.log('1. Login as Sherwin at http://localhost:8081');
    console.log('2. Navigate to "My Courses" to see all course types');
    console.log('3. Each course demonstrates different GHL features');
    
    console.log(`\n${colors.green}✨ Done!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

// Run the script
console.clear();
createSherwinCourses();