// Script to update all existing courses to use the latest GHL schema
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin123'
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

// Map old course data to new GHL schema
function mapToGHLSchema(course) {
  // Determine course type based on existing data
  let courseType = 'Custom';
  if (course.duration && course.duration.includes('7 days')) {
    courseType = 'Sprint';
  } else if (course.duration && course.duration.includes('month')) {
    courseType = 'Marathon';
  } else if (course.subscriptionPeriod || course.pricingModel === 'Subscription') {
    courseType = 'Membership';
  }
  
  // Determine pricing model
  let pricingModel = 'OneTime';
  if (course.price === 0) {
    pricingModel = 'Free';
  } else if (course.subscriptionPeriod) {
    pricingModel = 'Subscription';
  } else if (course.numberOfPayments) {
    pricingModel = 'PaymentPlan';
  }
  
  // Build the updated course object
  const updatedCourse = {
    id: course.id,
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription || course.description?.substring(0, 100),
    price: course.price || 0,
    duration: course.duration || 'Self-paced',
    level: course.level || 'Beginner',
    category: course.category || 'General',
    courseType: courseType,
    pricingModel: pricingModel,
    currency: course.currency || 'PHP',
    language: course.language || 'en',
    accessType: course.accessType || 'Lifetime',
    accessDuration: course.accessDuration,
    thumbnailUrl: course.thumbnailUrl || course.thumbnail,
    status: course.status || 'Draft',
    
    // GHL specific features
    hasCertificate: course.hasCertificate !== undefined ? course.hasCertificate : true,
    hasCommunity: course.hasCommunity !== undefined ? course.hasCommunity : (courseType === 'Membership'),
    hasLiveSessions: course.hasLiveSessions !== undefined ? course.hasLiveSessions : (courseType === 'Marathon' || courseType === 'Membership'),
    hasDownloadableResources: course.hasDownloadableResources !== undefined ? course.hasDownloadableResources : true,
    hasAssignments: course.hasAssignments !== undefined ? course.hasAssignments : (course.price > 0),
    hasQuizzes: course.hasQuizzes !== undefined ? course.hasQuizzes : (course.price > 0),
    
    // Additional GHL fields
    dripContent: course.dripContent || false,
    dripScheduleJson: course.dripScheduleJson,
    enrollmentLimit: course.enrollmentLimit,
    welcomeEmailEnabled: true,
    completionCertificateEnabled: course.hasCertificate !== false,
    progressRemindersEnabled: courseType !== 'Sprint',
    abandonmentSequenceEnabled: courseType === 'Membership',
    
    // Payment plan details
    numberOfPayments: course.numberOfPayments,
    paymentAmount: course.paymentAmount,
    paymentFrequency: course.paymentFrequency || 'Monthly',
    
    // Subscription details
    subscriptionPeriod: course.subscriptionPeriod || (pricingModel === 'Subscription' ? 'Monthly' : null),
    
    // Keep existing data
    instructorId: course.instructorId,
    modules: course.modules,
    objectives: course.objectives,
    requirements: course.requirements,
    targetAudience: course.targetAudience
  };
  
  return updatedCourse;
}

async function updateCoursesSchema() {
  console.log('🔄 Updating Courses to GHL Schema\n');
  
  try {
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    
    const authToken = loginResponse.accessToken || loginResponse.token;
    if (!authToken) {
      throw new Error('No auth token received');
    }
    console.log('✅ Login successful\n');
    
    // Get all courses
    console.log('📚 Fetching all courses...');
    const coursesResponse = await makeRequest(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const courses = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse.data || [];
    console.log(`Found ${courses.length} courses\n`);
    
    if (courses.length === 0) {
      console.log('No courses to update.');
      return;
    }
    
    // Update each course
    console.log('🔄 Updating courses...\n');
    let successCount = 0;
    let failedCount = 0;
    
    for (const course of courses) {
      console.log(`Updating: ${course.title}`);
      
      // Check if already has GHL fields
      if (course.courseType && course.pricingModel) {
        console.log(`  ✓ Already has GHL schema\n`);
        successCount++;
        continue;
      }
      
      try {
        // Map to new schema
        const updatedCourse = mapToGHLSchema(course);
        
        // Update via API
        await makeRequest(`${API_BASE_URL}/courses/${course.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(updatedCourse)
        });
        
        console.log(`  ✅ Updated successfully`);
        console.log(`     Type: ${updatedCourse.courseType}`);
        console.log(`     Pricing: ${updatedCourse.pricingModel}\n`);
        successCount++;
        
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}\n`);
        failedCount++;
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n📊 Update Summary');
    console.log('==================');
    console.log(`Total Courses: ${courses.length}`);
    console.log(`✅ Updated: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    
    // Verify updates
    console.log('\n🔍 Verifying updates...');
    const verifyResponse = await makeRequest(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const updatedCourses = Array.isArray(verifyResponse) ? verifyResponse : verifyResponse.data || [];
    const ghlCourses = updatedCourses.filter(c => c.courseType && c.pricingModel);
    
    console.log(`${ghlCourses.length} courses now have GHL schema`);
    
    // Show course type distribution
    const typeDistribution = ghlCourses.reduce((acc, c) => {
      acc[c.courseType] = (acc[c.courseType] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nCourse Type Distribution:');
    Object.entries(typeDistribution).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n✨ Schema update complete!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('\nPlease ensure:');
    console.log('1. Backend API is running on port 5295');
    console.log('2. Admin credentials are correct');
  }
}

// Run the update
updateCoursesSchema();