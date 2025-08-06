// Detailed Test Script with Database Verification
// This script tests course creation and directly queries the database to verify data integrity

const axios = require('axios');
const { Pool } = require('pg');

// Configuration
const API_BASE_URL = 'http://localhost:5295/api';
const TEST_INSTRUCTOR_EMAIL = 'sherwin.alegre@test.com'; // Update with actual test creator email
const TEST_INSTRUCTOR_PASSWORD = 'Test123!'; // Update with actual password

// PostgreSQL connection configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'cece_learning_portal',
  user: 'postgres',
  password: 'your_password' // Update with actual password
};

// Create database connection pool
const pool = new Pool(dbConfig);

// Test data for edge cases and validation
const EDGE_CASE_COURSES = [
  {
    name: "Minimum Required Fields - Sprint",
    data: {
      title: "Minimal Sprint Course",
      description: "Testing with only required fields for sprint course type",
      price: 500,
      level: "Beginner",
      category: "Programming",
      courseType: "Sprint"
    }
  },
  {
    name: "Free Course with All Features",
    data: {
      title: "Free Full-Featured Course",
      description: "Testing free course with all features enabled to ensure no payment conflicts",
      shortDescription: "Free but fully featured",
      price: 0,
      level: "Intermediate",
      category: "Design",
      courseType: "Custom",
      pricingModel: "free",
      courseFeatures: {
        certificate: true,
        community: true,
        liveSessions: true,
        downloadableResources: true,
        assignments: true,
        quizzes: true
      },
      enrollmentLimit: 50
    }
  },
  {
    name: "Subscription with Drip Content",
    data: {
      title: "Monthly Subscription with Drip",
      description: "Testing subscription model with sequential drip content release",
      price: 2999,
      level: "Advanced",
      category: "Business",
      courseType: "Membership",
      pricingModel: "subscription",
      subscriptionPeriod: "monthly",
      dripContent: true,
      dripSchedule: {
        type: "sequential",
        delayDays: 14
      },
      modules: [
        {
          title: "Week 1-2 Content",
          description: "Released immediately",
          order: 1,
          lessons: [
            {
              title: "Welcome to the Membership",
              type: "Video",
              duration: "10:00",
              order: 1
            }
          ]
        },
        {
          title: "Week 3-4 Content",
          description: "Released after 14 days",
          order: 2,
          lessons: [
            {
              title: "Advanced Topics",
              type: "Video",
              duration: "45:00",
              order: 1
            }
          ]
        }
      ]
    }
  },
  {
    name: "Payment Plan Course",
    data: {
      title: "Expensive Course with Payment Plan",
      description: "Testing payment plan functionality with high-priced course",
      price: 9999,
      level: "Advanced",
      category: "Programming",
      courseType: "Marathon",
      pricingModel: "payment-plan",
      paymentPlanDetails: {
        numberOfPayments: 12,
        paymentAmount: 833.25,
        frequency: "monthly"
      },
      accessType: "lifetime",
      courseFeatures: {
        certificate: true,
        community: true,
        liveSessions: true,
        downloadableResources: true,
        assignments: true,
        quizzes: true
      }
    }
  },
  {
    name: "Limited Access Course",
    data: {
      title: "30-Day Limited Access Course",
      description: "Testing limited time access functionality",
      price: 1499,
      level: "Beginner",
      category: "Marketing",
      courseType: "Sprint",
      pricingModel: "one-time",
      accessType: "limited",
      accessDuration: 30,
      automations: {
        welcomeEmail: true,
        completionCertificate: true,
        progressReminders: true,
        abandonmentSequence: true
      }
    }
  }
];

// Database verification queries
const DB_QUERIES = {
  getCourseById: `
    SELECT 
      c.*,
      u.full_name as instructor_name,
      u.email as instructor_email
    FROM "Courses" c
    JOIN "AspNetUsers" u ON c."InstructorId" = u."Id"
    WHERE c."Id" = $1
  `,
  
  getCourseModules: `
    SELECT * FROM "CourseModules"
    WHERE "CourseId" = $1
    ORDER BY "Order"
  `,
  
  getModuleLessons: `
    SELECT * FROM "Lessons"
    WHERE "ModuleId" = $1
    ORDER BY "Order"
  `,
  
  getCoursesByType: `
    SELECT 
      "CourseType",
      COUNT(*) as count,
      AVG("Price") as avg_price
    FROM "Courses"
    WHERE "InstructorId" = $1
    GROUP BY "CourseType"
  `,
  
  getCoursesWithFeatures: `
    SELECT 
      "Title",
      "CourseType",
      "PricingModel",
      "HasCertificate",
      "HasCommunity",
      "HasLiveSessions",
      "HasDownloadableResources",
      "HasAssignments",
      "HasQuizzes",
      "DripContent",
      "AccessType",
      "EnrollmentLimit"
    FROM "Courses"
    WHERE "InstructorId" = $1
    ORDER BY "CreatedAt" DESC
  `
};

// Helper functions
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return {
      token: response.data.token,
      userId: response.data.userId
    };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

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

async function verifyCourseInDB(courseId) {
  const client = await pool.connect();
  try {
    // Get course details
    const courseResult = await client.query(DB_QUERIES.getCourseById, [courseId]);
    const course = courseResult.rows[0];
    
    // Get modules
    const modulesResult = await client.query(DB_QUERIES.getCourseModules, [courseId]);
    const modules = modulesResult.rows;
    
    // Get lessons for each module
    for (const module of modules) {
      const lessonsResult = await client.query(DB_QUERIES.getModuleLessons, [module.Id]);
      module.lessons = lessonsResult.rows;
    }
    
    return {
      course,
      modules,
      totalLessons: modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
    };
  } finally {
    client.release();
  }
}

async function getCourseStatsByInstructor(instructorId) {
  const client = await pool.connect();
  try {
    const typeStats = await client.query(DB_QUERIES.getCoursesByType, [instructorId]);
    const featureStats = await client.query(DB_QUERIES.getCoursesWithFeatures, [instructorId]);
    
    return {
      byType: typeStats.rows,
      withFeatures: featureStats.rows
    };
  } finally {
    client.release();
  }
}

// Validation functions
function validateCourseData(expected, actual) {
  const errors = [];
  
  // Basic field validation
  if (expected.title && actual.Title !== expected.title) {
    errors.push(`Title mismatch: expected "${expected.title}", got "${actual.Title}"`);
  }
  
  if (expected.courseType && actual.CourseType !== expected.courseType) {
    errors.push(`CourseType mismatch: expected "${expected.courseType}", got "${actual.CourseType}"`);
  }
  
  if (expected.pricingModel && actual.PricingModel !== expected.pricingModel) {
    errors.push(`PricingModel mismatch: expected "${expected.pricingModel}", got "${actual.PricingModel}"`);
  }
  
  if (expected.price !== undefined && parseFloat(actual.Price) !== expected.price) {
    errors.push(`Price mismatch: expected ${expected.price}, got ${actual.Price}`);
  }
  
  // Feature validation
  if (expected.courseFeatures) {
    const features = expected.courseFeatures;
    if (features.certificate !== undefined && actual.HasCertificate !== features.certificate) {
      errors.push(`HasCertificate mismatch: expected ${features.certificate}, got ${actual.HasCertificate}`);
    }
    if (features.community !== undefined && actual.HasCommunity !== features.community) {
      errors.push(`HasCommunity mismatch: expected ${features.community}, got ${actual.HasCommunity}`);
    }
    if (features.liveSessions !== undefined && actual.HasLiveSessions !== features.liveSessions) {
      errors.push(`HasLiveSessions mismatch: expected ${features.liveSessions}, got ${actual.HasLiveSessions}`);
    }
  }
  
  // Access validation
  if (expected.accessType && actual.AccessType !== expected.accessType) {
    errors.push(`AccessType mismatch: expected "${expected.accessType}", got "${actual.AccessType}"`);
  }
  
  if (expected.accessDuration !== undefined && actual.AccessDuration !== expected.accessDuration) {
    errors.push(`AccessDuration mismatch: expected ${expected.accessDuration}, got ${actual.AccessDuration}`);
  }
  
  return errors;
}

// Main test function
async function runDetailedTests() {
  console.log('🚀 Starting Detailed Course Creation Tests...\n');
  
  let authData;
  const testResults = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    authData = await login(TEST_INSTRUCTOR_EMAIL, TEST_INSTRUCTOR_PASSWORD);
    console.log('✅ Login successful!');
    console.log(`   User ID: ${authData.userId}\n`);
  } catch (error) {
    console.error('❌ Login failed. Please check credentials.');
    return;
  }

  // Step 2: Test standard course types
  console.log('📚 Step 2: Testing Standard Course Types');
  console.log('=====================================\n');
  
  // Import COURSE_TYPES from the previous script
  const fs = require('fs');
  const previousScript = fs.readFileSync('./test-course-creation.js', 'utf8');
  eval(previousScript.match(/const COURSE_TYPES = {[\s\S]*?^};/m)[0]);
  
  for (const [typeName, courseData] of Object.entries(COURSE_TYPES)) {
    console.log(`Testing ${typeName}...`);
    
    try {
      // Create course via API
      const createdCourse = await createCourse(courseData, authData.token);
      console.log(`✅ API: Course created with ID ${createdCourse.id}`);
      
      // Verify in database
      const dbData = await verifyCourseInDB(createdCourse.id);
      console.log(`✅ DB: Found course in database`);
      console.log(`   - Modules: ${dbData.modules.length}`);
      console.log(`   - Total Lessons: ${dbData.totalLessons}`);
      
      // Validate data
      const errors = validateCourseData(courseData, dbData.course);
      if (errors.length === 0) {
        console.log(`✅ Validation: All fields match\n`);
        testResults.passed++;
      } else {
        console.log(`⚠️  Validation: Found ${errors.length} mismatches:`);
        errors.forEach(e => console.log(`   - ${e}`));
        console.log();
        testResults.failed++;
      }
      
      testResults.details.push({
        type: typeName,
        courseId: createdCourse.id,
        status: errors.length === 0 ? 'PASSED' : 'FAILED',
        errors
      });
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}\n`);
      testResults.failed++;
      testResults.details.push({
        type: typeName,
        status: 'FAILED',
        error: error.message
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 3: Test edge cases
  console.log('\n📊 Step 3: Testing Edge Cases');
  console.log('============================\n');
  
  for (const testCase of EDGE_CASE_COURSES) {
    console.log(`Testing: ${testCase.name}...`);
    
    try {
      const createdCourse = await createCourse(testCase.data, authData.token);
      console.log(`✅ Course created with ID ${createdCourse.id}`);
      
      const dbData = await verifyCourseInDB(createdCourse.id);
      const errors = validateCourseData(testCase.data, dbData.course);
      
      if (errors.length === 0) {
        console.log(`✅ Validation passed\n`);
        testResults.passed++;
      } else {
        console.log(`⚠️  Validation issues: ${errors.length}\n`);
        testResults.failed++;
      }
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}\n`);
      testResults.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 4: Database statistics
  console.log('\n📈 Step 4: Database Statistics');
  console.log('============================\n');
  
  try {
    const stats = await getCourseStatsByInstructor(authData.userId);
    
    console.log('Courses by Type:');
    stats.byType.forEach(row => {
      console.log(`   ${row.CourseType}: ${row.count} courses (avg price: ₱${parseFloat(row.avg_price).toFixed(2)})`);
    });
    
    console.log('\nFeature Usage:');
    const featureCount = stats.withFeatures.reduce((acc, course) => {
      if (course.HasCertificate) acc.certificate++;
      if (course.HasCommunity) acc.community++;
      if (course.HasLiveSessions) acc.liveSessions++;
      if (course.DripContent) acc.dripContent++;
      return acc;
    }, { certificate: 0, community: 0, liveSessions: 0, dripContent: 0 });
    
    Object.entries(featureCount).forEach(([feature, count]) => {
      console.log(`   ${feature}: ${count} courses`);
    });
    
  } catch (error) {
    console.error('Failed to get statistics:', error.message);
  }

  // Final summary
  console.log('\n\n========================================');
  console.log('📊 FINAL TEST SUMMARY');
  console.log('========================================');
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  
  // Cleanup
  await pool.end();
  console.log('\n✨ Tests completed! Database connection closed.');
}

// Run the tests
runDetailedTests().catch(error => {
  console.error('Fatal error:', error);
  pool.end();
});