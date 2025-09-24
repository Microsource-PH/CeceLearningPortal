async function testLoginAPI() {
  try {
    console.log('=== TESTING LOGIN API ===\n');
    
    const loginData = {
      email: 'admin@example.com',
      password: 'Admin123!'
    };
    
    console.log('Sending login request to: http://localhost:5295/api/auth/login');
    console.log('Data:', loginData);
    
    const response = await fetch('http://localhost:5295/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      console.log('❌ Login failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error data:', errorData);
      } catch (e) {
        console.log('Could not parse error as JSON');
      }
    } else {
      console.log('✅ Login successful!');
      try {
        const data = JSON.parse(responseText);
        console.log('Success data:', data);
      } catch (e) {
        console.log('Could not parse success response as JSON');
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testLoginAPI();