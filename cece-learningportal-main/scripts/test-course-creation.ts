async function testCourseCreation() {
  try {
    console.log('=== TESTING COURSE CREATION API ===\n');
    
    // First login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'creator@example.com',
        password: 'Creator123!'
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful! User:', loginData.email, 'Role:', loginData.role);
    const token = loginData.accessToken;
    
    // Test course creation
    console.log('\n2. Creating course...');
    const courseData = {
      title: 'Test Course API',
      description: 'This is a test course created via API',
      category: 'Technology',
      level: 'Beginner',
      price: 99,
      originalPrice: 149,
      duration: '4 weeks',
      features: ['Video lessons', 'Downloadable resources', 'Certificate'],
      courseType: 'Custom',
      status: 'draft'
    };
    
    console.log('Course data:', courseData);
    
    const courseResponse = await fetch('http://localhost:3003/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(courseData)
    });
    
    console.log('\nCourse creation response status:', courseResponse.status);
    const responseText = await courseResponse.text();
    console.log('Response body:', responseText);
    
    if (courseResponse.ok) {
      const createdCourse = JSON.parse(responseText);
      console.log('\n✅ Course created successfully!');
      console.log('Course ID:', createdCourse.id);
      console.log('Title:', createdCourse.title);
      console.log('Features:', createdCourse.features);
    } else {
      console.log('❌ Course creation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCourseCreation();