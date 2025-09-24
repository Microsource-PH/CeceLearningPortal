// Test Script for Course Creation - All Types
// This script tests the course creation endpoint for all course types (Sprint, Marathon, Membership, Custom)
// and verifies that each type is properly saved in the database

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5295/api';
const TEST_INSTRUCTOR_EMAIL = 'sherwin.alegre@test.com'; // Update with actual test creator email
const TEST_INSTRUCTOR_PASSWORD = 'Test123!'; // Update with actual password

// Test data for different course types
const COURSE_TYPES = {
  SPRINT: {
    title: "Sprint Course: JavaScript Basics in 7 Days",
    description: "Learn JavaScript fundamentals in just one week with this intensive sprint course. Perfect for beginners who want to quickly grasp the basics of JavaScript programming.",
    shortDescription: "Master JavaScript basics in 7 days",
    price: 999,
    duration: "7 days",
    level: "Beginner",
    category: "Programming",
    courseType: "Sprint",
    pricingModel: "one-time",
    currency: "PHP",
    language: "en",
    accessType: "lifetime",
    features: ["Daily exercises", "Quick wins", "Fast-paced learning"],
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
        title: "Day 1-2: JavaScript Basics",
        description: "Variables, data types, and operators",
        order: 1,
        lessons: [
          {
            title: "Introduction to JavaScript",
            type: "Video",
            duration: "15:00",
            order: 1
          },
          {
            title: "Variables and Data Types",
            type: "Video",
            duration: "20:00",
            order: 2
          }
        ]
      },
      {
        title: "Day 3-4: Functions and Control Flow",
        description: "Learn about functions and control structures",
        order: 2,
        lessons: [
          {
            title: "Functions in JavaScript",
            type: "Video",
            duration: "25:00",
            order: 1
          },
          {
            title: "Conditional Statements",
            type: "Video",
            duration: "20:00",
            order: 2
          }
        ]
      }
    ]
  },

  MARATHON: {
    title: "Marathon Course: Complete Web Development Bootcamp",
    description: "A comprehensive 6-month journey to become a full-stack web developer. This marathon course covers everything from HTML/CSS to advanced React and Node.js, including real-world projects.",
    shortDescription: "Complete web development training program",
    price: 4999,
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
      paymentAmount: 833.17,
      frequency: "monthly"
    },
    features: ["Comprehensive curriculum", "Multiple projects", "Career guidance", "Job preparation"],
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
    modules: [
      {
        title: "Module 1: HTML & CSS Fundamentals",
        description: "Master the building blocks of web development",
        order: 1,
        lessons: [
          {
            title: "Introduction to HTML",
            type: "Video",
            duration: "45:00",
            order: 1
          },
          {
            title: "CSS Basics",
            type: "Video",
            duration: "60:00",
            order: 2
          },
          {
            title: "HTML & CSS Project",
            type: "Assignment",
            duration: "2 hours",
            order: 3
          }
        ]
      },
      {
        title: "Module 2: JavaScript Deep Dive",
        description: "Comprehensive JavaScript programming",
        order: 2,
        lessons: [
          {
            title: "Advanced JavaScript Concepts",
            type: "Video",
            duration: "90:00",
            order: 1
          },
          {
            title: "ES6+ Features",
            type: "Video",
            duration: "60:00",
            order: 2
          },
          {
            title: "JavaScript Quiz",
            type: "Quiz",
            duration: "30:00",
            order: 3
          }
        ]
      }
    ]
  },

  MEMBERSHIP: {
    title: "Membership: Premium Coding Academy",
    description: "Get unlimited access to all our coding courses, live sessions, and exclusive content. New courses added monthly, weekly live Q&A sessions, and access to our private community.",
    shortDescription: "All-access membership to coding courses",
    price: 1999,
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
    features: ["All courses access", "Monthly new content", "Live sessions", "Community access", "Priority support"],
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
    },
    modules: [
      {
        title: "Welcome to Premium Coding Academy",
        description: "Get started with your membership",
        order: 1,
        lessons: [
          {
            title: "Welcome & Orientation",
            type: "Video",
            duration: "10:00",
            order: 1
          },
          {
            title: "How to Navigate the Platform",
            type: "Document",
            duration: "5:00",
            order: 2
          }
        ]
      }
    ]
  },

  CUSTOM: {
    title: "Custom Course: AI & Machine Learning for Beginners",
    description: "A customized learning path for understanding AI and Machine Learning concepts. This course is designed specifically for beginners with no prior programming experience.",
    shortDescription: "Beginner-friendly AI/ML course",
    price: 0,
    duration: "Self-paced",
    level: "Beginner",
    category: "Data Science",
    courseType: "Custom",
    pricingModel: "free",
    currency: "PHP",
    language: "en",
    accessType: "lifetime",
    enrollmentLimit: 100,
    features: ["Self-paced learning", "Practical examples", "No prerequisites"],
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
        title: "Introduction to AI",
        description: "Understanding artificial intelligence",
        order: 1,
        lessons: [
          {
            title: "What is AI?",
            type: "Video",
            duration: "30:00",
            order: 1
          },
          {
            title: "AI in Daily Life",
            type: "Document",
            duration: "15:00",
            order: 2
          },
          {
            title: "AI Concepts Quiz",
            type: "Quiz",
            duration: "20:00",
            order: 3
          }
        ]
      }
    ]
  }
};

// Helper function to login and get auth token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to create a course
async function createCourse(courseData, authToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/courses`,
      courseData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Course creation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to verify course in database
async function verifyCourse(courseId, authToken) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/courses/${courseId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Course verification failed:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to get all courses by instructor
async function getInstructorCourses(authToken) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/courses/instructor`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get instructor courses:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Course Creation Tests...\n');
  
  let authToken;
  const testResults = {
    passed: 0,
    failed: 0,
    courses: []
  };

  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in as instructor...');
    authToken = await login(TEST_INSTRUCTOR_EMAIL, TEST_INSTRUCTOR_PASSWORD);
    console.log('✅ Login successful!\n');
  } catch (error) {
    console.error('❌ Login failed. Please check credentials and try again.');
    return;
  }

  // Step 2: Test each course type
  for (const [typeName, courseData] of Object.entries(COURSE_TYPES)) {
    console.log(`\n📚 Testing ${typeName} Course Creation...`);
    console.log('================================');
    
    try {
      // Create course
      console.log(`Creating ${typeName} course...`);
      const createdCourse = await createCourse(courseData, authToken);
      console.log(`✅ ${typeName} course created successfully!`);
      console.log(`   Course ID: ${createdCourse.id}`);
      console.log(`   Title: ${createdCourse.title}`);
      
      // Verify course in database
      console.log(`Verifying ${typeName} course in database...`);
      const verifiedCourse = await verifyCourse(createdCourse.id, authToken);
      
      // Validate key fields
      const validationErrors = [];
      
      if (verifiedCourse.title !== courseData.title) {
        validationErrors.push(`Title mismatch: expected "${courseData.title}", got "${verifiedCourse.title}"`);
      }
      
      if (verifiedCourse.courseType?.toLowerCase() !== courseData.courseType.toLowerCase()) {
        validationErrors.push(`CourseType mismatch: expected "${courseData.courseType}", got "${verifiedCourse.courseType}"`);
      }
      
      if (courseData.pricingModel !== 'free' && verifiedCourse.price !== courseData.price) {
        validationErrors.push(`Price mismatch: expected ${courseData.price}, got ${verifiedCourse.price}`);
      }
      
      if (validationErrors.length > 0) {
        console.log(`⚠️  Validation issues found:`);
        validationErrors.forEach(error => console.log(`   - ${error}`));
        testResults.failed++;
      } else {
        console.log(`✅ ${typeName} course verified successfully in database!`);
        testResults.passed++;
      }
      
      testResults.courses.push({
        type: typeName,
        id: createdCourse.id,
        title: createdCourse.title,
        status: validationErrors.length === 0 ? 'PASSED' : 'FAILED',
        errors: validationErrors
      });
      
    } catch (error) {
      console.error(`❌ ${typeName} course test failed:`, error.message);
      testResults.failed++;
      testResults.courses.push({
        type: typeName,
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 3: Get all instructor courses
  console.log('\n\n📊 Fetching all instructor courses...');
  try {
    const allCourses = await getInstructorCourses(authToken);
    console.log(`✅ Found ${allCourses.length} total courses for this instructor`);
    
    // Group by course type
    const coursesByType = {};
    allCourses.forEach(course => {
      const type = course.courseType || 'Unknown';
      coursesByType[type] = (coursesByType[type] || 0) + 1;
    });
    
    console.log('\nCourses by type:');
    Object.entries(coursesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} courses`);
    });
  } catch (error) {
    console.error('❌ Failed to fetch instructor courses');
  }

  // Print summary
  console.log('\n\n========================================');
  console.log('📈 TEST SUMMARY');
  console.log('========================================');
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  
  console.log('\nDetailed Results:');
  testResults.courses.forEach(course => {
    const icon = course.status === 'PASSED' ? '✅' : '❌';
    console.log(`\n${icon} ${course.type}:`);
    console.log(`   ID: ${course.id || 'N/A'}`);
    console.log(`   Title: ${course.title || 'N/A'}`);
    console.log(`   Status: ${course.status}`);
    if (course.errors && course.errors.length > 0) {
      console.log(`   Errors:`);
      course.errors.forEach(error => console.log(`     - ${error}`));
    }
    if (course.error) {
      console.log(`   Error: ${course.error}`);
    }
  });
  
  console.log('\n✨ Test completed!');
}

// Run the tests
runTests().catch(console.error);