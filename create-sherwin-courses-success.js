// Script to create Sherwin's courses - final working version
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
  console.log(`${colors.blue}🚀 Creating Sherwin's GHL Courses${colors.reset}\n`);
  
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
    
    // Get and delete existing courses
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
    
    // Sprint Course
    console.log(`${colors.cyan}📘 Creating Sprint Course${colors.reset}`);
    const sprintCourse = await makeRequest(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        title: "PHP Mastery Sprint: 7-Day Intensive",
        description: "Master PHP fundamentals in just 7 days with this intensive sprint course. Perfect for developers who want to quickly add PHP to their skillset.",
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
          lessons: [
            { title: "Welcome & Course Overview", type: "Video", duration: "15:00", order: 1, isPreview: true },
            { title: "Installing PHP & XAMPP", type: "Video", duration: "20:00", order: 2 }
          ]
        }]
      })
    });
    console.log(`   ${colors.green}✅ Created: ${sprintCourse.title} (ID: ${sprintCourse.id})${colors.reset}\n`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Membership Course
    console.log(`${colors.cyan}📘 Creating Membership Course${colors.reset}`);
    const membershipCourse = await makeRequest(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        title: "Sherwin's Coding Academy Membership",
        description: "Get unlimited access to our ever-growing library of programming courses, tutorials, and resources. New content added monthly.",
        shortDescription: "All-access membership to programming courses",
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
          description: "Get oriented with your membership",
          order: 1,
          lessons: [
            { title: "Welcome from Sherwin", type: "Video", duration: "10:00", order: 1, isPreview: true },
            { title: "How to Navigate", type: "Video", duration: "15:00", order: 2 }
          ]
        }]
      })
    });
    console.log(`   ${colors.green}✅ Created: ${membershipCourse.title} (ID: ${membershipCourse.id})${colors.reset}\n`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Custom Course (Free)
    console.log(`${colors.cyan}📘 Creating Custom Course${colors.reset}`);
    const customCourse = await makeRequest(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        title: "Introduction to Programming Thinking",
        description: "This free introductory course is designed for absolute beginners who want to understand the fundamentals of programming.",
        shortDescription: "Free intro to programming concepts",
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
          description: "Core concepts every programmer should know",
          order: 1,
          lessons: [
            { title: "What is Programming?", type: "Video", duration: "25:00", order: 1, isPreview: true },
            { title: "How Computers Think", type: "Video", duration: "20:00", order: 2, isPreview: true }
          ]
        }]
      })
    });
    console.log(`   ${colors.green}✅ Created: ${customCourse.title} (ID: ${customCourse.id})${colors.reset}\n`);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Marathon Course - Create separately with retry logic
    console.log(`${colors.cyan}📘 Creating Marathon Course${colors.reset}`);
    let marathonCourse = null;
    let retries = 0;
    
    while (!marathonCourse && retries < 3) {
      try {
        marathonCourse = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({
            title: "Full-Stack Web Development Marathon",
            description: "Embark on a comprehensive 6-month journey to become a full-stack web developer with weekly live sessions and mentorship.",
            shortDescription: "6-month intensive full-stack program",
            category: "Programming",
            level: "Beginner",
            language: "en",
            duration: "6 months",
            thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
            courseType: "Marathon",
            pricingModel: "OneTime", // Use OneTime instead of PaymentPlan to avoid issues
            price: 8999,
            currency: "PHP",
            accessType: "Lifetime",
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
              title: "Week 1-2: Web Fundamentals",
              description: "Master HTML5, CSS3, and responsive design",
              order: 1,
              lessons: [
                { title: "Marathon Kickoff Live", type: "Live", duration: "90:00", order: 1 },
                { title: "HTML5 Essentials", type: "Video", duration: "45:00", order: 2 }
              ]
            }]
          })
        });
        console.log(`   ${colors.green}✅ Created: ${marathonCourse.title} (ID: ${marathonCourse.id})${colors.reset}\n`);
      } catch (error) {
        retries++;
        if (retries < 3) {
          console.log(`   ${colors.yellow}⚠️  Retry ${retries}/3...${colors.reset}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log(`   ${colors.red}❌ Failed to create Marathon course: ${error.message}${colors.reset}\n`);
        }
      }
    }
    
    // Summary
    console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
    console.log('==========\n');
    
    console.log(`${colors.green}✨ Successfully created courses:${colors.reset}`);
    console.log(`   ${colors.yellow}• Sprint:${colors.reset} PHP Mastery Sprint (ID: ${sprintCourse.id})`);
    console.log(`   ${colors.yellow}• Membership:${colors.reset} Coding Academy Membership (ID: ${membershipCourse.id})`);
    console.log(`   ${colors.yellow}• Custom:${colors.reset} Intro to Programming (ID: ${customCourse.id})`);
    if (marathonCourse) {
      console.log(`   ${colors.yellow}• Marathon:${colors.reset} Full-Stack Development (ID: ${marathonCourse.id})`);
    }
    
    console.log(`\n${colors.blue}📱 Next Steps:${colors.reset}`);
    console.log('1. Login as Sherwin at http://localhost:8081');
    console.log('2. Navigate to "My Courses" to see all 4 course types');
    console.log('3. Each course demonstrates different GHL features:');
    console.log(`   ${colors.yellow}• Sprint:${colors.reset} Fast-paced intensive learning`);
    console.log(`   ${colors.yellow}• Marathon:${colors.reset} Long-term structured program`);
    console.log(`   ${colors.yellow}• Membership:${colors.reset} Subscription-based access`);
    console.log(`   ${colors.yellow}• Custom:${colors.reset} Free course with flexible options`);
    
    console.log(`\n${colors.green}✨ Done!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

// Run the script
console.clear();
createSherwinCourses();