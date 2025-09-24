// Simple test to check if server is running
async function testServer() {
  try {
    console.log('Testing server health...');
    const response = await fetch('http://localhost:5295/api/health');
    console.log('Health endpoint status:', response.status);
    const text = await response.text();
    console.log('Health response:', text);
    
    if (response.ok) {
      // Try courses endpoint
      console.log('\nTesting courses endpoint...');
      const coursesResponse = await fetch('http://localhost:5295/api/courses');
      console.log('Courses endpoint status:', coursesResponse.status);
      
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        console.log('Number of courses:', courses.length);
        if (courses.length > 0) {
          console.log('First course features:', courses[0].features);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testServer();