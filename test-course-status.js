// Test script to verify course status after publishing

async function testCourseStatus() {
  const baseUrl = 'http://localhost:5173';
  
  // First, get the current courses from admin API
  try {
    // Get the auth token from localStorage (you'll need to be logged in as admin)
    console.log('\n1. Open the browser console while logged in as admin');
    console.log('2. Run: localStorage.getItem("token")');
    console.log('3. Copy the token and update the token variable below');
    console.log('\n4. Then check the admin course management page to see the course statuses');
    
    console.log('\nExpected CourseStatus enum values:');
    console.log('0 = Draft');
    console.log('1 = PendingApproval');
    console.log('2 = Active');
    console.log('3 = Inactive');
    console.log('4 = Archived');
    
    console.log('\nTo test a specific course status after publishing:');
    console.log('1. Note the course ID after publishing');
    console.log('2. Check /api/courses/{id}/status endpoint');
    console.log('3. Check /api/admin/courses endpoint to see how it appears in admin');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Course Status Debugging Guide');
console.log('=============================');
testCourseStatus();