// Test script to verify course filtering in the marketplace
// Run this in the browser console while logged in as different users

async function testCourseFiltering() {
  console.log('Testing Course Filtering in Marketplace');
  console.log('=======================================');
  
  // Get current user
  const auth = localStorage.getItem('auth');
  if (!auth) {
    console.error('Not logged in! Please login first.');
    return;
  }
  
  const currentUser = JSON.parse(auth);
  console.log('Current User:', currentUser.email, 'Role:', currentUser.role);
  console.log('User ID:', currentUser.id);
  
  // Get all courses from localStorage
  const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
  console.log('\nTotal courses in localStorage:', allCourses.length);
  
  // Check courses by instructor
  const coursesByInstructor = {};
  allCourses.forEach(course => {
    const instructorId = course.instructorId || course.instructor_id;
    const instructorName = course.instructorName || course.instructor_name || 'Unknown';
    
    if (!coursesByInstructor[instructorId]) {
      coursesByInstructor[instructorId] = {
        name: instructorName,
        courses: []
      };
    }
    coursesByInstructor[instructorId].courses.push({
      id: course.id,
      title: course.title,
      instructorId: instructorId
    });
  });
  
  console.log('\nCourses by Instructor:');
  Object.entries(coursesByInstructor).forEach(([instructorId, data]) => {
    console.log(`\nInstructor: ${data.name} (ID: ${instructorId})`);
    data.courses.forEach(course => {
      console.log(`  - ${course.title} (Course ID: ${course.id})`);
    });
  });
  
  // Test My Courses filter
  if (currentUser.role === 'Creator' || currentUser.role === 'Instructor') {
    const myCourses = allCourses.filter(course => {
      const courseInstructorId = course.instructorId || course.instructor_id;
      return courseInstructorId === currentUser.id;
    });
    
    console.log('\n\nMy Courses (Creator View):');
    console.log('==========================');
    console.log('Should only show courses where instructorId matches current user ID');
    console.log(`Found ${myCourses.length} courses for current creator`);
    myCourses.forEach(course => {
      console.log(`- ${course.title} (Instructor ID: ${course.instructorId || course.instructor_id})`);
    });
  }
  
  // Check current tab
  console.log('\n\nCurrent Tab State:');
  console.log('==================');
  const activeTab = document.querySelector('[role="tab"][data-state="active"]');
  if (activeTab) {
    console.log('Active Tab:', activeTab.textContent);
  }
  
  // Check displayed courses
  const displayedCourses = document.querySelectorAll('[data-testid="course-card"], .course-card, [class*="course"]');
  console.log('Courses displayed on page:', displayedCourses.length);
  
  console.log('\n\nRecommendations:');
  console.log('================');
  console.log('1. Login as instructor@example.com to test creator filtering');
  console.log('2. Check My Courses tab - should only show Dr. Sarah Johnson courses');
  console.log('3. Check Browse Courses tab - should show all courses');
  console.log('4. Check Instructors tab - should group courses by instructor');
}

// Run the test
testCourseFiltering();