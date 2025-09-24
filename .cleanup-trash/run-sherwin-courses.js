// Quick script to create courses for already-approved Sherwin Alegre account
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Sherwin's credentials (assuming account is already approved)
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
const COURSES = [
  {
    name: "Sherwin's Sprint: Quick PHP Mastery",
    courseType: "Sprint",
    pricingModel: "OneTime",
    price: 1299
  },
  {
    name: "Sherwin's Full-Stack Web Development Marathon",
    courseType: "Marathon", 
    pricingModel: "PaymentPlan",
    price: 5999
  },
  {
    name: "Sherwin's Coding Academy Membership",
    courseType: "Membership",
    pricingModel: "Subscription", 
    price: 2499
  },
  {
    name: "Sherwin's Free Introduction to Programming",
    courseType: "Custom",
    pricingModel: "Free",
    price: 0
  }
];

async function createCourses() {
  console.log('🎓 Creating Courses for Sherwin Alegre\n');
  
  // Login
  console.log('🔐 Logging in...');
  try {
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS)
    });
    
    if (!loginResponse.accessToken) {
      throw new Error('No token received');
    }
    
    console.log('✅ Login successful!\n');
    const authToken = loginResponse.accessToken;
    
    // Create each course
    console.log('📚 Creating Courses\n');
    
    for (const courseInfo of COURSES) {
      console.log(`Creating: ${courseInfo.name}`);
      console.log(`Type: ${courseInfo.courseType}, Price: ₱${courseInfo.price}`);
      
      const courseData = {
        title: courseInfo.name,
        description: `${courseInfo.name} - A comprehensive course by Sherwin Alegre`,
        shortDescription: courseInfo.name,
        price: courseInfo.price,
        duration: courseInfo.courseType === "Sprint" ? "7 days" : courseInfo.courseType === "Marathon" ? "6 months" : "Ongoing",
        level: "Beginner",
        category: "Programming",
        courseType: courseInfo.courseType,
        pricingModel: courseInfo.pricingModel,
        currency: "PHP",
        language: "en",
        accessType: "Lifetime",
        thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
        hasCertificate: true,
        hasDownloadableResources: true,
        hasAssignments: courseInfo.price > 0,
        hasQuizzes: courseInfo.price > 0,
        hasCommunity: courseInfo.courseType === "Membership",
        hasLiveSessions: courseInfo.courseType === "Marathon" || courseInfo.courseType === "Membership"
      };
      
      // Add payment plan details for Marathon
      if (courseInfo.pricingModel === "PaymentPlan") {
        courseData.numberOfPayments = 6;
        courseData.paymentAmount = 999.83;
        courseData.paymentFrequency = "Monthly";
      }
      
      // Add subscription details for Membership
      if (courseInfo.pricingModel === "Subscription") {
        courseData.subscriptionPeriod = "Monthly";
        courseData.accessType = "Limited";
        courseData.accessDuration = 30;
      }
      
      try {
        const response = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(courseData)
        });
        
        console.log(`✅ Created! Course ID: ${response.id}\n`);
      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✨ Done! Sherwin Alegre\'s courses have been created.');
    console.log('\nNext steps:');
    console.log('1. Login as Sherwin at http://localhost:8081');
    console.log('2. Go to "My Courses" to see the created courses');
    console.log('3. Edit and publish courses as needed');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('\nPlease ensure:');
    console.log('1. Sherwin Alegre\'s account is approved');
    console.log('2. The backend API is running');
    console.log('\nTo approve: Admin Panel > Users & Subscriptions > Approve Sherwin Alegre');
  }
}

createCourses();