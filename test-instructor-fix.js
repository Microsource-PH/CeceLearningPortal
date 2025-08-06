// Test script to verify instructor data loading
// Run this in the browser console while on the marketplace page

async function testInstructorData() {
  console.log('🔍 Testing Instructor Data Loading');
  console.log('===================================\n');
  
  // Get auth token
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!auth.token) {
    console.error('❌ Not logged in! Please login first.');
    return;
  }
  
  console.log('✅ Logged in as:', auth.email);
  
  // 1. Check Platform Analytics API
  console.log('\n1. Fetching Platform Analytics (topPerformers)...');
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
      
      if (data.topPerformers?.length > 0) {
        console.log('\n   Top Performers found:', data.topPerformers.length);
        data.topPerformers.forEach((performer, index) => {
          console.log(`\n   ${index + 1}. ${performer.instructorName} (ID: ${performer.instructorId})`);
          console.log(`      - Total Revenue: ${performer.totalRevenue} (number type: ${typeof performer.totalRevenue})`);
          console.log(`      - Should show as:`);
          console.log(`        * Creator Earnings (80%): ₱${(performer.totalRevenue * 0.8).toFixed(2)}`);
          console.log(`        * Platform Share (20%): ₱${(performer.totalRevenue * 0.2).toFixed(2)}`);
          console.log(`      - Total Students: ${performer.totalStudents}`);
          console.log(`      - Total Courses: ${performer.totalCourses}`);
          console.log(`      - Average Rating: ${performer.averageRating}`);
        });
        
        // Test specific instructor's courses
        const firstInstructor = data.topPerformers[0];
        if (firstInstructor) {
          console.log(`\n2. Testing course fetch for ${firstInstructor.instructorName}...`);
          
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
              console.log('\n   First course details:');
              const course = courses[0];
              console.log(`   - Title: ${course.title}`);
              console.log(`   - Price: ${course.price}`);
              console.log(`   - Students: ${course.studentsCount || course.students || 0}`);
              console.log(`   - Rating: ${course.averageRating || course.rating || 0}`);
              console.log(`   - Status: ${course.status}`);
            }
          } else {
            console.error('   ❌ Failed to fetch courses:', coursesResponse.status);
          }
        }
      } else {
        console.log('   ⚠️ No top performers data');
      }
    } else {
      console.error('❌ Failed to fetch platform analytics:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // 3. Check current page state
  console.log('\n3. Checking Current Page Elements...');
  
  // Check if instructors tab exists
  const instructorsTab = document.querySelector('[role="tab"][data-value="instructors"]');
  console.log('   Instructors tab found:', !!instructorsTab);
  
  // Check if it's active
  const activeTab = document.querySelector('[role="tab"][data-state="active"]');
  console.log('   Active tab:', activeTab?.textContent);
  
  // If instructors tab is active, check content
  if (activeTab?.textContent?.includes('Instructors')) {
    const instructorCards = document.querySelectorAll('.shadow-card');
    console.log(`   Instructor cards found: ${instructorCards.length}`);
    
    // Check for revenue displays
    const revenueTexts = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes('Creator Earnings') || 
      el.textContent?.includes('Platform Share')
    );
    console.log(`   Revenue display elements: ${revenueTexts.length}`);
    
    // Check for specific values
    const creatorEarnings = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent?.includes('Creator Earnings (80%)')
    );
    if (creatorEarnings) {
      console.log('   ✅ Found Creator Earnings element');
      const parent = creatorEarnings.closest('.text-center');
      if (parent) {
        const value = parent.querySelector('.text-xl.font-bold');
        console.log(`   Value displayed: "${value?.textContent}"`);
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('- If backend returns numbers, they should be formatted with formatPHP()');
  console.log('- Creator earnings should be totalRevenue * 0.8');
  console.log('- Platform share should be totalRevenue * 0.2');
  console.log('- All monetary values should show as ₱X,XXX.XX');
  console.log('- Ratings should show as X.XX');
}

// Run the test
testInstructorData();