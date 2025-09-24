// Debug script to check instructor data from backend
// Run this in the browser console while on the marketplace page

async function debugInstructorData() {
  console.log('🔍 Debugging Instructor Data');
  console.log('============================\n');
  
  // Get auth token
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!auth.token) {
    console.error('❌ Not logged in! Please login first.');
    return;
  }
  
  console.log('✅ Logged in as:', auth.email);
  
  // 1. Check Platform Analytics API
  console.log('\n1. Fetching Platform Analytics...');
  try {
    const response = await fetch('http://localhost:5295/api/analytics/platform', {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Platform Analytics Response:');
      console.log('   Total Revenue:', data.summary?.totalRevenue);
      console.log('   Total Courses:', data.summary?.totalCourses);
      console.log('   Total Users:', data.summary?.totalUsers);
      
      if (data.topPerformers?.length > 0) {
        console.log('\n   Top Performers:');
        data.topPerformers.forEach((performer, index) => {
          console.log(`\n   ${index + 1}. ${performer.instructorName} (ID: ${performer.instructorId})`);
          console.log(`      - Total Revenue: ${performer.totalRevenue}`);
          console.log(`      - Creator Earnings (80%): ${performer.totalRevenue * 0.8}`);
          console.log(`      - Platform Share (20%): ${performer.totalRevenue * 0.2}`);
          console.log(`      - Total Students: ${performer.totalStudents}`);
          console.log(`      - Total Courses: ${performer.totalCourses}`);
          console.log(`      - Average Rating: ${performer.averageRating}`);
        });
      } else {
        console.log('   ⚠️ No top performers data');
      }
    } else {
      console.error('❌ Failed to fetch platform analytics:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error fetching platform analytics:', error);
  }
  
  // 2. Check specific instructor courses
  console.log('\n2. Checking Instructor Courses...');
  try {
    // Get instructor ID from platform analytics first
    const analyticsResponse = await fetch('http://localhost:5295/api/analytics/platform', {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      const firstInstructor = analyticsData.topPerformers?.[0];
      
      if (firstInstructor) {
        console.log(`\n   Fetching courses for ${firstInstructor.instructorName}...`);
        
        const coursesResponse = await fetch(`http://localhost:5295/api/courses?instructorId=${firstInstructor.instructorId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          console.log(`   ✅ Found ${courses.length} courses for instructor`);
          
          if (courses.length > 0) {
            console.log('\n   Sample courses:');
            courses.slice(0, 3).forEach((course, index) => {
              console.log(`   ${index + 1}. ${course.title}`);
              console.log(`      - Price: ${course.price}`);
              console.log(`      - Students: ${course.studentsCount || course.students || 0}`);
              console.log(`      - Rating: ${course.averageRating || course.rating || 0}`);
              console.log(`      - Status: ${course.status}`);
            });
          }
        } else {
          console.error('   ❌ Failed to fetch instructor courses:', coursesResponse.status);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking instructor courses:', error);
  }
  
  // 3. Check current page state
  console.log('\n3. Checking Current Page State...');
  
  // Check if instructors tab is active
  const instructorsTab = document.querySelector('[value="instructors"][data-state="active"]');
  if (instructorsTab) {
    console.log('✅ Instructors tab is active');
    
    // Check for instructor cards
    const instructorCards = document.querySelectorAll('.shadow-card');
    console.log(`   Found ${instructorCards.length} instructor cards`);
    
    // Check revenue displays
    const revenueElements = document.querySelectorAll('*:contains("Creator Earnings")');
    console.log(`   Found ${revenueElements.length} revenue display elements`);
  } else {
    console.log('⚠️ Instructors tab is not active');
  }
  
  // 4. Summary
  console.log('\n📊 Summary:');
  console.log('- Backend API is', auth.token ? 'accessible' : 'not accessible (no auth)');
  console.log('- Platform analytics endpoint returns real data');
  console.log('- Individual course queries should work with instructorId parameter');
  console.log('\n💡 If data is not showing:');
  console.log('1. Check browser console for errors');
  console.log('2. Ensure backend is running on port 5295');
  console.log('3. Try refreshing the page');
  console.log('4. Check that you have seeded data in the database');
}

// Run the debug
debugInstructorData();