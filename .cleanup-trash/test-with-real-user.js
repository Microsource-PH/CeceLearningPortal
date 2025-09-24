// Test Script with Real User Credentials
// This script creates courses for Sherwin Alegre using actual credentials

const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:5295/api';

// We'll try different possible credentials for Sherwin Alegre
const POSSIBLE_CREDENTIALS = [
  { email: 'sherwin.alegre@example.com', password: 'Password123!' },
  { email: 'sherwin@example.com', password: 'Password123!' },
  { email: 'salegre@example.com', password: 'Password123!' },
  { email: 'sherwin.alegre@gmail.com', password: 'Password123!' },
  { email: 'creator2@example.com', password: 'Password123!' }, // Generic creator account
];

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = http;
    
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

// Test courses with Sherwin Alegre's name
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
      pricingModel: "one-time",
      currency: "PHP",
      language: "en",
      accessType: "lifetime",
      thumbnailUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=400",
      courseFeatures: {
        certificate: true,
        community: false,
        liveSessions: false,
        downloadableResources: true,
        assignments: true,
        quizzes: true
      },
      modules: [
        {
          title: "Getting Started with PHP",
          description: "Introduction to PHP programming",
          order: 1,
          lessons: [
            {
              title: "Welcome & PHP Setup",
              type: "Video",
              duration: "15:00",
              order: 1
            },
            {
              title: "Your First PHP Script",
              type: "Video",
              duration: "20:00",
              order: 2
            }
          ]
        }
      ]
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
      pricingModel: "payment-plan",
      currency: "PHP",
      language: "en",
      accessType: "lifetime",
      paymentPlanDetails: {
        numberOfPayments: 6,
        paymentAmount: 999.83,
        frequency: "monthly"
      },
      thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400",
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
      }
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
      pricingModel: "subscription",
      subscriptionPeriod: "monthly",
      currency: "PHP",
      language: "en",
      accessType: "limited",
      accessDuration: 30,
      thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
      enrollmentLimit: 500,
      courseFeatures: {
        certificate: true,
        community: true,
        liveSessions: true,
        downloadableResources: true,
        assignments: false,
        quizzes: false
      },
      automations: {
        welcomeEmail: true,
        completionCertificate: false,
        progressReminders: true,
        abandonmentSequence: true
      }
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
      pricingModel: "free",
      currency: "PHP",
      language: "en",
      accessType: "lifetime",
      enrollmentLimit: 1000,
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
      courseFeatures: {
        certificate: true,
        community: true,
        liveSessions: false,
        downloadableResources: true,
        assignments: true,
        quizzes: true
      },
      automations: {
        welcomeEmail: true,
        completionCertificate: true,
        progressReminders: false,
        abandonmentSequence: false
      },
      modules: [
        {
          title: "Programming Fundamentals",
          description: "Core concepts every programmer should know",
          order: 1,
          lessons: [
            {
              title: "What is Programming?",
              type: "Video",
              duration: "25:00",
              order: 1
            },
            {
              title: "Choosing Your First Language",
              type: "Video",
              duration: "30:00",
              order: 2
            },
            {
              title: "Setting Up Your Development Environment",
              type: "Document",
              duration: "15:00",
              order: 3
            }
          ]
        }
      ]
    }
  }
];

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Main function
async function createSherwinCourses() {
  console.log(`${colors.blue}🎓 Creating Courses for Sherwin Alegre${colors.reset}\n`);
  
  let authToken = null;
  let successfulLogin = null;
  
  // Try to login with different credentials
  console.log(`${colors.yellow}🔐 Attempting to login...${colors.reset}\n`);
  
  for (const creds of POSSIBLE_CREDENTIALS) {
    process.stdout.write(`Trying ${creds.email}... `);
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(creds)
      });
      
      if (response.token) {
        authToken = response.token;
        successfulLogin = creds.email;
        console.log(`${colors.green}✅ Success!${colors.reset}`);
        break;
      }
    } catch (error) {
      console.log(`${colors.red}❌ Failed${colors.reset}`);
    }
  }
  
  if (!authToken) {
    console.log(`\n${colors.red}❌ Could not login with any credentials.${colors.reset}`);
    console.log('\nPlease ensure:');
    console.log('1. A creator account exists (you can create one via the signup page)');
    console.log('2. The account has been approved by admin');
    console.log('3. The backend API is running');
    
    // Try to create a new account
    console.log(`\n${colors.yellow}💡 Tip: You can create a new creator account by:${colors.reset}`);
    console.log('1. Go to http://localhost:8081/login');
    console.log('2. Click "Sign up"');
    console.log('3. Select "Creator" role');
    console.log('4. Use email: sherwin.alegre@example.com');
    console.log('5. Wait for admin approval');
    return;
  }
  
  console.log(`\n${colors.green}✅ Logged in as: ${successfulLogin}${colors.reset}\n`);
  
  // Create courses
  console.log(`${colors.cyan}📚 Creating Sherwin's Courses${colors.reset}`);
  console.log('================================\n');
  
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
createSherwinCourses().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
});