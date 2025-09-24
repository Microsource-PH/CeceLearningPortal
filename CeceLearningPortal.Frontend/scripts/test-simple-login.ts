async function testSimpleLogin() {
  try {
    console.log('Testing simple login...');
    
    const response = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'creator@example.com',
        password: 'Creator123!'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSimpleLogin();