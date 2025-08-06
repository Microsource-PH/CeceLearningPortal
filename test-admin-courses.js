const fetch = require('node-fetch');

async function testAdminCourses() {
  try {
    // First, let's login as admin
    const loginResponse = await fetch('https://localhost:7251/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
      // Ignore SSL certificate errors for development
      agent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      console.error('Failed to login');
      return;
    }

    // Now fetch admin courses
    const coursesResponse = await fetch('https://localhost:7251/api/admin/courses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      // Ignore SSL certificate errors for development
      agent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });

    const coursesData = await coursesResponse.json();
    console.log('Admin courses response:', JSON.stringify(coursesData, null, 2));
    
    // Log just the statuses
    if (Array.isArray(coursesData)) {
      console.log('\nCourse statuses:');
      coursesData.forEach(course => {
        console.log(`- ${course.title}: ${course.status} (type: ${typeof course.status})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminCourses();