// Script to create all 4 course types with minimal fields
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

// Minimal courses for each type
const COURSES = [
  {
    // SPRINT
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
    hasCertificate: true,
    hasCommunity: false,
    hasLiveSessions: false,
    hasDownloadableResources: true,
    hasAssignments: true,
    hasQuizzes: true,
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: true,
    modules: [{
      title: "Day 1: PHP Fundamentals",
      description: "Get started with PHP",
      order: 1,
      lessons: [{ title: "Welcome", type: "Video", duration: "15:00", order: 1 }]
    }]
  },
  {
    // MARATHON
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
  },
  {
    // MEMBERSHIP
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
    hasCertificate: false,
    hasCommunity: true,
    hasLiveSessions: true,
    hasDownloadableResources: true,
    hasAssignments: false,
    hasQuizzes: false,
    dripContent: true,
    dripScheduleJson: JSON.stringify({
      type: "scheduled",
      delayDays: 0
    }),
    automationWelcomeEmail: true,
    automationCompletionCertificate: false,
    automationProgressReminders: true,
    automationAbandonmentSequence: true,
    modules: [{
      title: "Welcome to the Academy",
      description: "Get oriented",
      order: 1,
      lessons: [{ title: "Welcome", type: "Video", duration: "10:00", order: 1 }]
    }]
  },
  {
    // CUSTOM
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
    hasCertificate: true,
    hasCommunity: true,
    hasLiveSessions: false,
    hasDownloadableResources: true,
    hasAssignments: true,
    hasQuizzes: true,
    dripContent: false,
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: false,
    automationAbandonmentSequence: false,
    modules: [{
      title: "Programming Fundamentals",
      description: "Core concepts",
      order: 1,
      lessons: [{ title: "What is Programming?", type: "Video", duration: "25:00", order: 1 }]
    }]
  }
];

async function createAllCourseTypes() {
  console.log('🚀 Creating All Course Types\n');
  
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
    
    // Delete existing courses first
    console.log('🗑️  Deleting existing courses...');
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
        console.log(`   ✅ Deleted: ${course.title}`);
      } catch (error) {
        console.log(`   ❌ Failed to delete: ${course.title}`);
      }
    }
    console.log('');
    
    // Create courses
    console.log('📚 Creating courses...\n');
    const results = [];
    
    for (const course of COURSES) {
      console.log(`📘 Creating ${course.courseType} course: ${course.title}`);
      
      try {
        const response = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(course)
        });
        
        console.log(`   ✅ Created successfully! (ID: ${response.id})\n`);
        results.push({ type: course.courseType, success: true, id: response.id });
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
        results.push({ type: course.courseType, success: false, error: error.message });
      }
      
      // Add delay between course creation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 Summary');
    console.log('==========');
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${results.length - successful}`);
    
    console.log('\nCreated courses:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  • ${r.type} (ID: ${r.id})`);
    });
    
    if (results.some(r => !r.success)) {
      console.log('\nFailed courses:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  • ${r.type}: ${r.error}`);
      });
    }
    
    console.log('\n✨ Done!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the script
createAllCourseTypes();